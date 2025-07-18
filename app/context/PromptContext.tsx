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
// ✅ NOUVEAU : Imports pour notifications
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

const STORAGE_KEY = "prompts";
const LAST_CHECK_KEY = "lastScheduleCheck"; // ✅ NOUVEAU : Pour tracker les prompts manqués

// ✅ NOUVEAU : Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // ✅ AJOUTÉ
    shouldShowList: true, // ✅ AJOUTÉ
  }),
});

/**
 * 📝 Type d'un prompt étendu avec support des catégories (Phase 2)
 */
export type Prompt = {
  id: string;
  question: string;
  response: string;
  source: string;
  updatedAt: string;
  category?: string;
  scheduled?: {
    hour: number;
    minute: number;
    frequency: "daily";
    lastRun?: string;
    isRecurring?: boolean;
    notificationId?: string; // ✅ NOUVEAU : ID de la notification planifiée
  };
};

/**
 * 🎯 Interface du contexte étendue pour la Phase 2
 */
type PromptContextType = {
  prompts: Prompt[];
  addPrompt: (question: string, options?: AddPromptOptions) => Promise<void>;
  checkAndRunScheduledPrompts: () => Promise<void>;
  removePrompt: (id: string) => void;
  clearPrompts: () => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  getScheduledPrompts: () => Prompt[];
  getExecutedPrompts: () => Prompt[];
  getPromptsByCategory: (category: string) => Prompt[];
  getCategoryStats: () => Record<string, number>;
  isLoading: boolean;
  error: string | null;
  notificationsEnabled: boolean; // ✅ NOUVEAU
  requestNotificationPermissions: () => Promise<boolean>; // ✅ NOUVEAU
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
  category?: string;
};

/**
 * 🔧 Création du contexte avec valeur par défaut
 */
const PromptContext = createContext<PromptContextType | undefined>(undefined);

/**
 * 🚀 Provider amélioré avec support des notifications (CORRECTIONS CRITIQUES)
 */
export function PromptProvider({ children }: { children: ReactNode }) {
  // États principaux
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); // ✅ NOUVEAU

  // ✅ SUPPRIMÉ : timeoutsRef (remplacé par notifications)
  const isInitializedRef = useRef(false);

  /**
   * ✅ NOUVEAU : Demander les permissions de notification
   */
  const requestNotificationPermissions =
    useCallback(async (): Promise<boolean> => {
      if (!Device.isDevice) {
        console.log("📱 Notifications non supportées sur simulateur");
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("❌ Permission de notification refusée");
        setNotificationsEnabled(false);
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Prompts planifiés",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#81b0ff",
        });
      }

      console.log("✅ Permissions de notification accordées");
      setNotificationsEnabled(true);
      return true;
    }, []);

  /**
   * ✅ NOUVEAU : Planifier une notification pour un prompt
   */
  const scheduleNotification = useCallback(
    async (prompt: Prompt): Promise<string | null> => {
      if (!prompt.scheduled || !notificationsEnabled) return null;

      try {
        // ✅ CORRIGÉ : Calculer le trigger de notification avec types corrects (sans repeats)
        const trigger: Notifications.NotificationTriggerInput = prompt.scheduled
          .isRecurring
          ? {
              type: Notifications.SchedulableTriggerInputTypes.DAILY, // ✅ DAILY = répétition automatique
              hour: prompt.scheduled.hour,
              minute: prompt.scheduled.minute,
              // repeats est implicite pour DAILY - SUPPRIMÉ
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.DATE, // ✅ DATE = exécution unique
              date: (() => {
                const scheduleDate = new Date();
                scheduleDate.setHours(
                  prompt.scheduled!.hour,
                  prompt.scheduled!.minute,
                  0,
                  0
                );

                // Si l'heure est déjà passée aujourd'hui, programmer pour demain
                if (scheduleDate <= new Date()) {
                  scheduleDate.setDate(scheduleDate.getDate() + 1);
                }

                return scheduleDate;
              })(),
              // repeats est implicite pour DATE (false) - SUPPRIMÉ
            };

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "🤖 Prompt planifié",
            body:
              prompt.question.length > 100
                ? prompt.question.substring(0, 100) + "..."
                : prompt.question,
            data: { promptId: prompt.id },
          },
          trigger,
        });

        console.log(
          `📅 Notification planifiée pour "${prompt.question.substring(
            0,
            30
          )}..." (ID: ${notificationId})`
        );
        return notificationId;
      } catch (error) {
        console.error("❌ Erreur planification notification:", error);
        return null;
      }
    },
    [notificationsEnabled]
  );

  /**
   * ✅ NOUVEAU : Supprimer une notification planifiée
   */
  const cancelNotification = useCallback(async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`🗑️ Notification ${notificationId} supprimée`);
    } catch (error) {
      console.error("❌ Erreur suppression notification:", error);
    }
  }, []);

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
   * ✅ MODIFIÉ : Chargement initial avec vérification des prompts manqués
   */
  useEffect(() => {
    const loadPromptsAndCheckMissed = async () => {
      if (isInitializedRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // 1. Demander les permissions de notification dès le démarrage
        await requestNotificationPermissions();

        // 2. Charger les prompts sauvegardés
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          let loadedPrompts: Prompt[] = JSON.parse(saved);

          // Migration : Ajouter la catégorie "other" aux anciens prompts
          loadedPrompts = loadedPrompts.map((prompt) => ({
            ...prompt,
            category: prompt.category || "other",
          }));

          setPrompts(loadedPrompts);

          // 3. ✅ NOUVEAU : Vérifier les prompts manqués depuis la dernière ouverture
          await checkMissedScheduledPrompts(loadedPrompts);

          // 4. ✅ NOUVEAU : Replanifier les notifications pour les prompts récurrents
          for (const prompt of loadedPrompts) {
            if (prompt.scheduled && (prompt.scheduled.isRecurring ?? true)) {
              const notificationId = await scheduleNotification(prompt);
              if (
                notificationId &&
                notificationId !== prompt.scheduled.notificationId
              ) {
                // Mettre à jour l'ID de notification si nécessaire
                setPrompts((prev) =>
                  prev.map((p) =>
                    p.id === prompt.id && p.scheduled
                      ? { ...p, scheduled: { ...p.scheduled, notificationId } }
                      : p
                  )
                );
              }
            }
          }
        }

        // 5. Sauvegarder le timestamp de cette vérification
        await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());

        isInitializedRef.current = true;
      } catch (loadError) {
        console.error("Erreur de chargement:", loadError);
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadPromptsAndCheckMissed();

    // ✅ NOUVEAU : Écouter les notifications reçues
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification reçue:", notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const promptId = response.notification.request.content.data?.promptId;
        if (promptId) {
          console.log("👆 Notification cliquée pour prompt:", promptId);
          // Ici on pourrait naviguer vers le prompt ou l'exécuter directement
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [requestNotificationPermissions, scheduleNotification]);

  /**
   * ✅ NOUVEAU : Vérifier et exécuter les prompts manqués avec logique améliorée
   */
  const checkMissedScheduledPrompts = useCallback(
    async (promptsToCheck: Prompt[]) => {
      try {
        const lastCheckStr = await AsyncStorage.getItem(LAST_CHECK_KEY);
        const lastCheck = lastCheckStr
          ? new Date(lastCheckStr)
          : new Date(Date.now() - 24 * 60 * 60 * 1000);
        const now = new Date();

        console.log(
          `🔍 Vérification prompts manqués depuis ${lastCheck.toLocaleString()}`
        );

        const missedPrompts: Prompt[] = [];

        for (const prompt of promptsToCheck) {
          if (!prompt.scheduled) continue;

          const { hour, minute, lastRun, isRecurring } = prompt.scheduled;

          // ✅ NOUVEAU : Logique plus conservatrice pour éviter les faux positifs
          if (isRecurring ?? true) {
            const todayScheduled = new Date();
            todayScheduled.setHours(hour, minute, 0, 0);

            const actualLastRun = lastRun ? new Date(lastRun) : new Date(0);
            const today = new Date().toDateString();

            // ✅ AMÉLIORATION : Conditions plus strictes pour éviter double exécution
            const isScheduledTimeInPast = todayScheduled < now;
            const wasNotExecutedToday = actualLastRun.toDateString() !== today;
            const isNotCurrentlyExecuting = !prompt.response.startsWith("⏳"); // ✅ NOUVEAU
            const isOldEnough =
              now.getTime() - todayScheduled.getTime() > 10000; // ✅ Au moins 10 secondes après l'heure prévue

            if (
              isScheduledTimeInPast &&
              wasNotExecutedToday &&
              isNotCurrentlyExecuting &&
              isOldEnough
            ) {
              missedPrompts.push(prompt);
            }
          }
        }

        console.log(
          `📝 ${missedPrompts.length} prompt(s) manqué(s) détecté(s)`
        );

        // Exécuter les prompts manqués avec un délai entre chaque
        for (const prompt of missedPrompts) {
          // ✅ NOUVEAU : Vérifier une dernière fois avant exécution
          const currentPrompt = promptsToCheck.find((p) => p.id === prompt.id);
          if (currentPrompt && !currentPrompt.response.startsWith("⏳")) {
            await executeScheduledPrompt(prompt);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s entre exécutions
          }
        }
      } catch (error) {
        console.error("❌ Erreur vérification prompts manqués:", error);
      }
    },
    []
  );

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
   * 🚀 Exécution optimisée des prompts planifiés avec protection contre double exécution
   */
  const executeScheduledPrompt = useCallback(async (prompt: Prompt) => {
    if (!prompt.scheduled) return;

    console.log(`🤖 Exécution du prompt planifié: ${prompt.question}`);

    try {
      // ✅ NOUVEAU : Marquer immédiatement le prompt comme "en cours" pour éviter double exécution
      const now = new Date().toISOString();

      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) =>
          p.id === prompt.id
            ? {
                ...p,
                response: "⏳ Exécution en cours...",
                scheduled: {
                  ...p.scheduled!,
                  lastRun: now, // ✅ CRITIQUE : Marquer comme exécuté AVANT l'appel API
                },
              }
            : p
        )
      );

      const result = await fetchAiResponseWithSources(prompt.question);
      const completionTime = new Date().toISOString();

      // Mettre à jour avec la réponse finale
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) =>
          p.id === prompt.id
            ? {
                ...p,
                response: result.response,
                source: result.sourcesFormatted,
                updatedAt: completionTime,
                scheduled: {
                  ...p.scheduled!,
                  lastRun: completionTime, // Confirmer l'heure de fin
                },
              }
            : p
        )
      );

      console.log(
        `✅ Prompt "${prompt.question.substring(0, 30)}..." exécuté avec succès`
      );
    } catch (error) {
      console.error("❌ Erreur lors de l'exécution du prompt planifié:", error);

      // En cas d'erreur, garder le timestamp de début pour éviter les re-tentatives immédiates
      const errorTime = new Date().toISOString();

      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) =>
          p.id === prompt.id
            ? {
                ...p,
                response: "❌ Erreur lors de l'exécution du prompt planifié",
                source: "Erreur",
                updatedAt: errorTime,
                scheduled: {
                  ...p.scheduled!,
                  lastRun: errorTime, // ✅ Marquer comme tenté même en cas d'erreur
                },
              }
            : p
        )
      );
    }
  }, []);

  /**
   * ✅ MODIFIÉ : Ajout optimisé de prompts avec notifications
   */
  const addPrompt = useCallback(
    async (question: string, options?: AddPromptOptions) => {
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
            category: options?.category || "other",
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
          // ✅ MODIFIÉ : Pour les prompts planifiés avec notifications
          const newPrompt: Prompt = {
            id: Date.now().toString(),
            question,
            response: "",
            source: "Planifié",
            updatedAt: now,
            category: options?.category || "other",
            scheduled: {
              hour: options?.hour ?? 7,
              minute: options?.minute ?? 0,
              frequency: "daily",
              lastRun: undefined,
              isRecurring: options?.isRecurring ?? true,
            },
          };

          // ✅ NOUVEAU : Planifier la notification
          if (options?.isRecurring ?? true) {
            const notificationId = await scheduleNotification(newPrompt);
            if (notificationId) {
              newPrompt.scheduled!.notificationId = notificationId;
            }
          }

          setPrompts((prev: Prompt[]) => [...prev, newPrompt]);
        }
      } catch (error) {
        console.error("❌ Erreur lors de l'ajout du prompt:", error);
        setError("Erreur lors de l'ajout du prompt");

        // Supprimer le prompt de chargement en cas d'erreur
        if (!isScheduled) {
          setPrompts((prev: Prompt[]) =>
            prev.filter(
              (p: Prompt) => p.response !== "⏳ Génération en cours..."
            )
          );
        }
      }
    },
    [scheduleNotification]
  );

  /**
   * ✅ MODIFIÉ : Suppression optimisée avec annulation des notifications
   */
  const removePrompt = useCallback(
    (id: string) => {
      // ✅ NOUVEAU : Annuler la notification associée
      const promptToRemove = prompts.find((p) => p.id === id);
      if (promptToRemove?.scheduled?.notificationId) {
        cancelNotification(promptToRemove.scheduled.notificationId);
      }

      setPrompts((prev: Prompt[]) => prev.filter((p: Prompt) => p.id !== id));
    },
    [prompts, cancelNotification]
  );

  /**
   * 🧹 Nettoyage optimisé avec préservation des planifiés
   */
  const clearPrompts = useCallback(async () => {
    const scheduledPrompts = prompts.filter((p: Prompt) => p.scheduled);
    setPrompts(scheduledPrompts);

    // ✅ NOUVEAU : Annuler les notifications des prompts supprimés
    const promptsToRemove = prompts.filter((p: Prompt) => !p.scheduled);
    for (const prompt of promptsToRemove) {
      if (prompt.scheduled?.notificationId) {
        await cancelNotification(prompt.scheduled.notificationId);
      }
    }

    await savePrompts(scheduledPrompts);
  }, [prompts, savePrompts, cancelNotification]);

  /**
   * ✅ MODIFIÉ : Mise à jour optimisée avec replanification des notifications
   */
  const updatePrompt = useCallback(
    (id: string, updates: Partial<Prompt>) => {
      setPrompts((prev: Prompt[]) =>
        prev.map((p: Prompt) => {
          if (p.id === id) {
            const updatedPrompt = { ...p, ...updates };

            // ✅ MODIFIÉ : Replanifier la notification si les paramètres ont changé
            if (updates.scheduled && updatedPrompt.scheduled?.isRecurring) {
              // Annuler l'ancienne notification
              if (p.scheduled?.notificationId) {
                cancelNotification(p.scheduled.notificationId);
              }

              // Planifier la nouvelle notification
              setTimeout(async () => {
                const newNotificationId = await scheduleNotification(
                  updatedPrompt
                );
                if (newNotificationId) {
                  setPrompts((prevPrompts) =>
                    prevPrompts.map((prompt) =>
                      prompt.id === id && prompt.scheduled
                        ? {
                            ...prompt,
                            scheduled: {
                              ...prompt.scheduled,
                              notificationId: newNotificationId,
                            },
                          }
                        : prompt
                    )
                  );
                }
              }, 100);
            }

            return updatedPrompt;
          }
          return p;
        })
      );
    },
    [scheduleNotification, cancelNotification]
  );

  /**
   * ✅ MODIFIÉ : Vérification manuelle optimisée des prompts planifiés
   */
  const checkAndRunScheduledPrompts = useCallback(async () => {
    await checkMissedScheduledPrompts(prompts);
  }, [prompts, checkMissedScheduledPrompts]);

  /**
   * 📊 Sélecteurs mémoïsés pour optimiser les performances (Phase 2)
   */
  const getScheduledPrompts = useMemo(
    () => () => prompts.filter((p: Prompt) => p.scheduled),
    [prompts]
  );

  const getExecutedPrompts = useMemo(
    () => () => prompts.filter((p: Prompt) => p.response && p.response !== ""),
    [prompts]
  );

  const getPromptsByCategory = useMemo(
    () => (category: string) =>
      prompts.filter((p: Prompt) => p.category === category),
    [prompts]
  );

  const getCategoryStats = useMemo(
    () => () => {
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
   * ✅ MODIFIÉ : Valeur du contexte mémoïsée avec nouvelles fonctionnalités
   */
  const contextValue = useMemo(
    () => ({
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
      notificationsEnabled, // ✅ NOUVEAU
      requestNotificationPermissions, // ✅ NOUVEAU
    }),
    [
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
      notificationsEnabled,
      requestNotificationPermissions,
    ]
  );

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
