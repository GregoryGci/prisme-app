import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchAiResponse } from "../utils/fetchAiResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "prompts";

// ✅ Définition du type d'un prompt
export type Prompt = {
  id: string;
  question: string;
  response: string;
  source: string;
  updatedAt: string;
  scheduled?: {
    hour: number;
    minute: number;
    frequency: "daily";
    lastRun?: string;
    isRecurring?: boolean; // Nouvelle propriété pour compatibilité
  };
};

// ✅ Interface du contexte pour TypeScript
type PromptContextType = {
  prompts: Prompt[];
  addPrompt: (
    question: string,
    options?: Partial<Prompt["scheduled"]>
  ) => Promise<void>;
  checkAndRunScheduledPrompts: () => Promise<void>;
  removePrompt: (id: string) => void;
  clearPrompts: () => void;
};

// ✅ Création du contexte
const PromptContext = createContext<PromptContextType | undefined>(undefined);

// ✅ Provider qui enveloppe l'app et donne accès au contexte
export function PromptProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // 🔁 Chargement automatique des prompts sauvegardés au lancement
  useEffect(() => {
    const loadPrompts = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loadedPrompts: Prompt[] = JSON.parse(saved);
        setPrompts(loadedPrompts);
        
        // Reprogrammer tous les prompts planifiés au démarrage
        loadedPrompts.forEach((prompt: Prompt) => {
          if (prompt.scheduled && (prompt.scheduled.isRecurring ?? true)) {
            schedulePromptExecution(prompt);
          }
        });
      }
    };
    loadPrompts();
  }, []);

  // 💾 Sauvegarde automatique des prompts à chaque modification
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  }, [prompts]);

  // 🔄 Fonction pour programmer l'exécution d'un prompt récurrent
  const schedulePromptExecution = (prompt: Prompt) => {
    if (!prompt.scheduled) return;

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(prompt.scheduled.hour, prompt.scheduled.minute, 0, 0);

    // Si l'heure est déjà passée aujourd'hui, programmer pour demain
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilExecution = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      executeScheduledPrompt(prompt);
    }, timeUntilExecution);
  };

  // 🚀 Fonction pour exécuter un prompt planifié
  const executeScheduledPrompt = async (prompt: Prompt) => {
    if (!prompt.scheduled) return;

    console.log(`Exécution du prompt planifié: ${prompt.question}`);

    try {
      // Générer la réponse
      const response = await fetchAiResponse(prompt.question);
      const now = new Date().toISOString();

      // Mettre à jour le prompt avec la nouvelle réponse
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) =>
          p.id === prompt.id
            ? {
                ...p,
                response,
                updatedAt: now,
                scheduled: {
                  ...p.scheduled!,
                  lastRun: now,
                },
              }
            : p
        )
      );

      // Si récurrent, programmer la prochaine exécution
      if (prompt.scheduled.isRecurring ?? true) {
        const nextExecution = new Date();
        nextExecution.setDate(nextExecution.getDate() + 1);
        nextExecution.setHours(prompt.scheduled.hour, prompt.scheduled.minute, 0, 0);

        const timeUntilNext = nextExecution.getTime() - Date.now();

        setTimeout(() => {
          executeScheduledPrompt(prompt);
        }, timeUntilNext);
      }
    } catch (error) {
      console.error("Erreur lors de l'exécution du prompt planifié:", error);
    }
  };

  // ✅ Ajout d'un prompt (manuel ou planifié)
  const addPrompt = async (
    question: string,
    options?: Partial<Prompt["scheduled"]>
  ) => {
    const now = new Date().toISOString();
    const isScheduled =
      !!options && options.hour !== undefined && options.minute !== undefined;

    // 🧠 Si c'est planifié → on ne génère PAS de réponse tout de suite
    const response = isScheduled ? "" : await fetchAiResponse(question);

    const newPrompt: Prompt = {
      id: Date.now().toString(),
      question,
      response,
      source: isScheduled ? "Planifié" : "GPT-3.5",
      updatedAt: now,
      scheduled: isScheduled
        ? {
            hour: options?.hour ?? 7,
            minute: options?.minute ?? 0,
            frequency: "daily",
            lastRun: undefined,
            isRecurring: options?.isRecurring ?? true, // Par défaut récurrent
          }
        : undefined,
    };

    setPrompts((prev: Prompt[]) => [...prev, newPrompt]);

    // Si c'est un prompt planifié et récurrent, le programmer
    if (isScheduled && (options?.isRecurring ?? true)) {
      schedulePromptExecution(newPrompt);
    }
  };

  // ✅ Supprime un seul prompt par ID
  const removePrompt = (id: string) => {
    setPrompts((prev: Prompt[]) => prev.filter((p: Prompt) => p.id !== id));
  };

  // ✅ Supprime tous les prompts exécutés (on garde les planifiés)
  const clearPrompts = async () => {
    const remaining = prompts.filter((p: Prompt) => p.scheduled);
    setPrompts(remaining);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  };

  // ✅ Vérifie si un prompt planifié doit être exécuté maintenant
  const checkAndRunScheduledPrompts = async () => {
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const today = now.toISOString().split("T")[0];

    const updated: Prompt[] = [];

    for (const prompt of prompts) {
      if (!prompt.scheduled) continue;

      const { hour, minute, lastRun } = prompt.scheduled;

      if (nowHours < hour || (nowHours === hour && nowMinutes < minute))
        continue;

      if (lastRun?.startsWith(today)) continue;

      const newResponse = await fetchAiResponse(prompt.question);

      updated.push({
        ...prompt,
        response: newResponse,
        updatedAt: now.toISOString(),
        scheduled: {
          ...prompt.scheduled,
          lastRun: now.toISOString(),
        },
      });
    }

    if (updated.length > 0) {
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) => updated.find((u: Prompt) => u.id === p.id) || p)
      );
    }
  };

  return (
    <PromptContext.Provider
      value={{
        prompts,
        addPrompt,
        checkAndRunScheduledPrompts,
        removePrompt,
        clearPrompts,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
}

// ✅ Hook pour accéder facilement au contexte depuis les composants
export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return context;
}