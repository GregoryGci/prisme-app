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

// ✅ Définition du type d’un prompt
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

// ✅ Provider qui enveloppe l’app et donne accès au contexte
export function PromptProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // 🔁 Chargement automatique des prompts sauvegardés au lancement
  useEffect(() => {
    const loadPrompts = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPrompts(JSON.parse(saved));
      }
    };
    loadPrompts();
  }, []);

  // 💾 Sauvegarde automatique des prompts à chaque modification
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
  }, [prompts]);

  // ✅ Ajout d’un prompt (manuel ou planifié)
  const addPrompt = async (
    question: string,
    options?: Partial<Prompt["scheduled"]>
  ) => {
    const now = new Date().toISOString();
    const isScheduled = !!options;

    // 🧠 Si c’est planifié → on ne génère PAS de réponse tout de suite
    const response = isScheduled
      ? ""
      : await fetchAiResponse(question);

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
          }
        : undefined,
    };

    setPrompts((prev) => [...prev, newPrompt]);
  };

  // ✅ Supprime un seul prompt par ID
  const removePrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  // ✅ Supprime tous les prompts exécutés (on garde les planifiés)
  const clearPrompts = async () => {
    const remaining = prompts.filter((p) => p.scheduled);
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
      setPrompts((prev) =>
        prev.map((p) => updated.find((u) => u.id === p.id) || p)
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
