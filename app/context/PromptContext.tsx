import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { fetchAiResponseWithSources } from "../utils/fetchAiResponse";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "prompts";

/**
 * 📝 Type d'un prompt étendu avec support des catégories (Phase 2)
 */
export type Prompt = {
  id: string;
  question: string;
  response: string;
  source: string;
  updatedAt: string;
  category?: string; // ✅ NOUVEAU : Support des catégories
  scheduled?: {
    hour: number;
    minute: number;
    frequency: "daily";
    lastRun?: string;
    isRecurring?: boolean;
  };
};

/**
 * 🎯 Interface du contexte étendue pour la Phase 2
 */
type PromptContextType = {
  prompts: Prompt[];
  addPrompt: (
    question: string,
    options?: AddPromptOptions // ✅ Utilisation du nouveau type
  ) => Promise<void>;
  checkAndRunScheduledPrompts: () => Promise<void>;
  removePrompt: (id: string) => void;
  clearPrompts: () => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  getScheduledPrompts: () => Prompt[];
  getExecutedPrompts: () => Prompt[];
  getPromptsByCategory: (category: string) => Prompt[]; // ✅ NOUVEAU
  getCategoryStats: () => Record<string, number>; // ✅ NOUVEAU
  isLoading: boolean;
  error: string | null;
};

/**
 * 🎯 Type pour les options d'ajout de prompt (Phase 2)
 */
type AddPromptOptions = {
  hour?: number;
  minute?: number;
  frequency?: "daily";
  lastRun?: string;
  isRecurring?: boolean;
  category?: string; // ✅ Catégorie ajoutée ici
};

/**
 * 🔧 Création du contexte avec valeur par défaut
 */
const PromptContext = createContext<PromptContextType | undefined>(undefined);

/**
 * 🚀 Provider amélioré avec support des catégories et fonctionnalités Phase 2
 */
export function PromptProvider({ children }: { children: ReactNode }) {
  // États principaux
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Références pour éviter les fuites mémoire
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isInitializedRef = useRef(false);

  /**
   * 💾 Fonction de sauvegarde optimisée avec gestion d'erreurs
   */
  const savePrompts = useCallback(async (promptsToSave: Prompt[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(promptsToSave));
      setError(null);
    } catch (saveError) {
      console.error("Erreur de sauvegarde:", saveError);
      setError("Erreur lors de la sauvegarde des données");
    }
  }, []);

  /**
   * 📖 Chargement initial avec migration des anciennes données
   */
  useEffect(() => {
    const loadPrompts = async () => {
      if (isInitializedRef.current) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          let loadedPrompts: Prompt[] = JSON.parse(saved);
          
          // ✅ Migration : Ajouter la catégorie "other" aux anciens prompts
          loadedPrompts = loadedPrompts.map(prompt => ({
            ...prompt,
            category: prompt.category || "other", // Catégorie par défaut
          }));
          
          setPrompts(loadedPrompts);

          // Reprogrammer les prompts récurrents au démarrage
          loadedPrompts.forEach((prompt: Prompt) => {
            if (prompt.scheduled && (prompt.scheduled.isRecurring ?? true)) {
              schedulePromptExecution(prompt);
            }
          });
        }
        
        isInitializedRef.current = true;
      } catch (loadError) {
        console.error("Erreur de chargement:", loadError);
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();

    // Nettoyage lors du démontage
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  /**
   * 💾 Sauvegarde automatique optimisée avec debounce
   */
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      savePrompts(prompts);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [prompts, savePrompts]);

  /**
   * 🔄 Fonction optimisée de programmation d'exécution
   */
  const schedulePromptExecution = useCallback((prompt: Prompt) => {
    if (!prompt.scheduled || !prompt.id) return;

    // Nettoyer le timeout précédent s'il existe
    const existingTimeout = timeoutsRef.current.get(prompt.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(
      prompt.scheduled.hour,
      prompt.scheduled.minute,
      0,
      0
    );

    // Si l'heure est déjà passée aujourd'hui, programmer pour demain
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilExecution = scheduledTime.getTime() - now.getTime();

    // Programmer l'exécution
    const timeoutId = setTimeout(() => {
      executeScheduledPrompt(prompt);
    }, timeUntilExecution);

    // Stocker la référence du timeout
    timeoutsRef.current.set(prompt.id, timeoutId);

    console.log(
      `📅 Prompt "${prompt.question.substring(0, 30)}..." programmé pour ${scheduledTime.toLocaleString()}`
    );
  }, []);

  /**
   * 🚀 Exécution optimisée des prompts planifiés
   */
  const executeScheduledPrompt = useCallback(async (prompt: Prompt) => {
    if (!prompt.scheduled) return;

    console.log(`🤖 Exécution du prompt planifié: ${prompt.question}`);

    try {
      // Mise à jour de l'état pour indiquer l'exécution en cours
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) =>
          p.id === prompt.id
            ? { ...p, response: "⏳ Exécution en cours..." }
            : p
        )
      );

      const result = await fetchAiResponseWithSources(prompt.question);
      const now = new Date().toISOString();

      // Mettre à jour avec la réponse finale
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) =>
          p.id === prompt.id
            ? {
                ...p,
                response: result.response,
                source: result.sourcesFormatted,
                updatedAt: now,
                scheduled: {
                  ...p.scheduled!,
                  lastRun: now,
                },
              }
            : p
        )
      );

      // Programmer la prochaine exécution si récurrent
      if (prompt.scheduled.isRecurring ?? true) {
        const updatedPrompt = { ...prompt };
        if (updatedPrompt.scheduled) {
          updatedPrompt.scheduled.lastRun = now;
        }
        schedulePromptExecution(updatedPrompt);
      } else {
        // Supprimer le timeout pour les prompts non récurrents
        timeoutsRef.current.delete(prompt.id);
      }

      console.log(`✅ Prompt "${prompt.question.substring(0, 30)}..." exécuté avec succès`);
      
    } catch (error) {
      console.error("❌ Erreur lors de l'exécution du prompt planifié:", error);
      
      // Mettre à jour avec un message d'erreur
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) =>
          p.id === prompt.id
            ? {
                ...p,
                response: "❌ Erreur lors de l'exécution du prompt planifié",
                source: "Erreur",
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    }
  }, [schedulePromptExecution]);

  /**
   * ➕ Ajout optimisé de prompts avec support des catégories
   */
  const addPrompt = useCallback(async (
    question: string,
    options?: AddPromptOptions // ✅ Type corrigé
  ) => {
    if (!question.trim()) {
      setError("Le prompt ne peut pas être vide");
      return;
    }

    const now = new Date().toISOString();
    const isScheduled =
      !!options && options.hour !== undefined && options.minute !== undefined;

    try {
      setError(null);
      
      // Pour les prompts immédiats, indiquer le chargement
      if (!isScheduled) {
        const loadingPrompt: Prompt = {
          id: Date.now().toString(),
          question,
          response: "⏳ Génération en cours...",
          source: "En cours",
          updatedAt: now,
          category: options?.category || "other", // ✅ Support catégorie
        };
        
        setPrompts((prev: Prompt[]) => [...prev, loadingPrompt]);
        
        // Exécuter immédiatement
        const result = await fetchAiResponseWithSources(question);
        
        setPrompts((prev: Prompt[]) =>
          prev.map((p: Prompt) =>
            p.id === loadingPrompt.id
              ? {
                  ...p,
                  response: result.response,
                  source: result.sourcesFormatted,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
      } else {
        // Pour les prompts planifiés
        const newPrompt: Prompt = {
          id: Date.now().toString(),
          question,
          response: "",
          source: "Planifié",
          updatedAt: now,
          category: options?.category || "other", // ✅ Support catégorie
          scheduled: {
            hour: options?.hour ?? 7,
            minute: options?.minute ?? 0,
            frequency: "daily",
            lastRun: undefined,
            isRecurring: options?.isRecurring ?? true,
          },
        };

        setPrompts((prev: Prompt[]) => [...prev, newPrompt]);

        // Programmer l'exécution si récurrent
        if (options?.isRecurring ?? true) {
          schedulePromptExecution(newPrompt);
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du prompt:", error);
      setError("Erreur lors de l'ajout du prompt");
      
      // Supprimer le prompt de chargement en cas d'erreur
      if (!isScheduled) {
        setPrompts((prev: Prompt[]) => 
          prev.filter((p: Prompt) => p.response !== "⏳ Génération en cours...")
        );
      }
    }
  }, [schedulePromptExecution]);

  /**
   * 🗑️ Suppression optimisée avec nettoyage des timeouts
   */
  const removePrompt = useCallback((id: string) => {
    // Nettoyer le timeout associé
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }

    setPrompts((prev: Prompt[]) => prev.filter((p: Prompt) => p.id !== id));
  }, []);

  /**
   * 🧹 Nettoyage optimisé avec préservation des planifiés
   */
  const clearPrompts = useCallback(async () => {
    const scheduledPrompts = prompts.filter((p: Prompt) => p.scheduled);
    setPrompts(scheduledPrompts);
    
    // Supprimer les timeouts des prompts non planifiés
    prompts.forEach((prompt) => {
      if (!prompt.scheduled) {
        const timeout = timeoutsRef.current.get(prompt.id);
        if (timeout) {
          clearTimeout(timeout);
          timeoutsRef.current.delete(prompt.id);
        }
      }
    });
    
    await savePrompts(scheduledPrompts);
  }, [prompts, savePrompts]);

  /**
   * ✏️ Mise à jour optimisée de prompts existants avec reprogrammation
   */
  const updatePrompt = useCallback((id: string, updates: Partial<Prompt>) => {
    setPrompts((prev: Prompt[]) =>
      prev.map((p: Prompt) => {
        if (p.id === id) {
          const updatedPrompt = { ...p, ...updates };
          
          // ✅ Reprogrammer si les paramètres de planification ont changé
          if (updates.scheduled && updatedPrompt.scheduled?.isRecurring) {
            // Nettoyer l'ancien timeout
            const timeout = timeoutsRef.current.get(id);
            if (timeout) {
              clearTimeout(timeout);
              timeoutsRef.current.delete(id);
            }
            
            // Programmer avec les nouveaux paramètres
            setTimeout(() => schedulePromptExecution(updatedPrompt), 100);
          }
          
          return updatedPrompt;
        }
        return p;
      })
    );
  }, [schedulePromptExecution]);

  /**
   * 🔍 Vérification manuelle optimisée des prompts planifiés
   */
  const checkAndRunScheduledPrompts = useCallback(async () => {
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const today = now.toISOString().split("T")[0];

    const promptsToUpdate: Prompt[] = [];

    for (const prompt of prompts) {
      if (!prompt.scheduled) continue;

      const { hour, minute, lastRun } = prompt.scheduled;

      // Vérifier si l'heure est atteinte
      if (nowHours < hour || (nowHours === hour && nowMinutes < minute))
        continue;

      // Vérifier si déjà exécuté aujourd'hui
      if (lastRun?.startsWith(today)) continue;

      try {
        const result = await fetchAiResponseWithSources(prompt.question);

        promptsToUpdate.push({
          ...prompt,
          response: result.response,
          source: result.sourcesFormatted,
          updatedAt: now.toISOString(),
          scheduled: {
            ...prompt.scheduled,
            lastRun: now.toISOString(),
          },
        });
      } catch (error) {
        console.error(`❌ Erreur pour le prompt ${prompt.id}:`, error);
        
        promptsToUpdate.push({
          ...prompt,
          response: "❌ Erreur lors de l'exécution",
          source: "Erreur",
          updatedAt: now.toISOString(),
          scheduled: {
            ...prompt.scheduled,
            lastRun: now.toISOString(),
          },
        });
      }
    }

    if (promptsToUpdate.length > 0) {
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) => 
          promptsToUpdate.find((u: Prompt) => u.id === p.id) || p
        )
      );
      
      console.log(`✅ ${promptsToUpdate.length} prompt(s) planifié(s) exécuté(s)`);
    }
  }, [prompts]);

  /**
   * 📊 Sélecteurs mémoïsés pour optimiser les performances (Phase 2)
   */
  const getScheduledPrompts = useMemo(() => 
    () => prompts.filter((p: Prompt) => p.scheduled),
    [prompts]
  );

  const getExecutedPrompts = useMemo(() => 
    () => prompts.filter((p: Prompt) => p.response && p.response !== ""),
    [prompts]
  );

  // ✅ NOUVEAU : Filtrage par catégorie
  const getPromptsByCategory = useMemo(() => 
    (category: string) => prompts.filter((p: Prompt) => p.category === category),
    [prompts]
  );

  // ✅ NOUVEAU : Statistiques par catégorie
  const getCategoryStats = useMemo(() => 
    () => {
      const stats: Record<string, number> = {};
      prompts.forEach((prompt) => {
        const category = prompt.category || "other";
        stats[category] = (stats[category] || 0) + 1;
      });
      return stats;
    },
    [prompts]
  );

  /**
   * 🎯 Valeur du contexte mémoïsée avec nouvelles fonctionnalités Phase 2
   */
  const contextValue = useMemo(() => ({
    prompts,
    addPrompt,
    checkAndRunScheduledPrompts,
    removePrompt,
    clearPrompts,
    updatePrompt,
    getScheduledPrompts,
    getExecutedPrompts,
    getPromptsByCategory, // ✅ NOUVEAU
    getCategoryStats, // ✅ NOUVEAU
    isLoading,
    error,
  }), [
    prompts,
    addPrompt,
    checkAndRunScheduledPrompts,
    removePrompt,
    clearPrompts,
    updatePrompt,
    getScheduledPrompts,
    getExecutedPrompts,
    getPromptsByCategory,
    getCategoryStats,
    isLoading,
    error,
  ]);

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
}

/**
 * 🪝 Hook optimisé pour accéder au contexte
 */
export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return context;
}

/**
 * 📚 NOUVELLES FONCTIONNALITÉS PHASE 2
 * 
 * ✅ SUPPORT DES CATÉGORIES :
 * - Type Prompt étendu avec champ category
 * - Migration automatique des anciennes données
 * - Catégorie par défaut "other" pour compatibilité
 * - Fonctions de filtrage par catégorie
 * 
 * ✅ GESTION AVANCÉE :
 * - updatePrompt avec reprogrammation automatique
 * - Statistiques par catégorie
 * - Filtrage intelligent par type et catégorie
 * - Préservation des timeouts lors des mises à jour
 * 
 * ✅ PERFORMANCE OPTIMISÉE :
 * - Sélecteurs mémoïsés pour éviter les recalculs
 * - Debounce de sauvegarde maintenu
 * - Gestion optimisée des timeouts
 * - Migration de données sans perte
 * 
 * ✅ ROBUSTESSE :
 * - Gestion d'erreurs complète maintenue
 * - États de chargement préservés
 * - Validation des données renforcée
 * - Nettoyage automatique des ressources
 * 
 * Cette version est entièrement rétrocompatible avec les données
 * existantes et ajoute toutes les fonctionnalités nécessaires
 * pour la Phase 2 de gestion avancée des prompts.
 */