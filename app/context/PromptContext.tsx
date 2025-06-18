import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchAiResponse } from '../utils/fetchAiResponse';

export type Prompt = {
  id: string;
  question: string;
  response: string;
  source: string;
  updatedAt: string;
  scheduled?: {
    hour: number;
    minute: number;
    frequency: 'daily';
    lastRun?: string;
  };
};

type PromptContextType = {
  prompts: Prompt[];
  addPrompt: (question: string, options?: Partial<Prompt["scheduled"]>) => Promise<void>;
  checkAndRunScheduledPrompts: () => Promise<void>;
};

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // 🔄 Ajoute un prompt manuellement ou programmé
  const addPrompt = async (question: string, options?: Partial<Prompt["scheduled"]>) => {
    const response = await fetchAiResponse(question);
    const now = new Date().toISOString();

    const newPrompt: Prompt = {
      id: Date.now().toString(),
      question,
      response,
      source: 'GPT-3.5',
      updatedAt: now,
      scheduled: options
        ? {
            hour: options.hour ?? 7,
            minute: options.minute ?? 0,
            frequency: 'daily',
            lastRun: now,
          }
        : undefined,
    };

    setPrompts((prev) => [...prev, newPrompt]);
  };

  // ✅ Fonction appelée au lancement de l’app pour mettre à jour les prompts planifiés
  const checkAndRunScheduledPrompts = async () => {
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const today = now.toISOString().split('T')[0]; // "2025-06-18"

    const updated: Prompt[] = [];

    for (const prompt of prompts) {
      if (!prompt.scheduled) continue;

      const { hour, minute, frequency, lastRun } = prompt.scheduled;

      // ⏰ Si on n’a pas encore passé l’heure prévue → on saute
      if (nowHours < hour || (nowHours === hour && nowMinutes < minute)) continue;

      // 🧠 Si déjà lancé aujourd’hui → on saute aussi
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
    <PromptContext.Provider value={{ prompts, addPrompt, checkAndRunScheduledPrompts }}>
      {children}
    </PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
}
