import axios from "axios";

const OPENAI_API_KEY =
  "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";

export async function fetchAiResponse(prompt: string): Promise<string> {
  try {
    console.log("Clé API utilisée :", OPENAI_API_KEY);
    console.log("→ Envoi du prompt à OpenAI...");

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        console.warn("🚨 Trop de requêtes envoyées (code 429)");
        console.error("Erreur Axios :", error.message);
        console.error("Statut :", error.response?.status);
        console.error("Détail complet :", error.toJSON?.() || error);
        return "⏳ Trop de requêtes. Attends un peu avant de réessayer.";
      }

      if (error.message === "Network Error") {
        console.warn("🚫 Erreur réseau / clé manquante");
        return "📴 Problème réseau ou clé API invalide.";
      }
    }

    console.error("❌ Erreur GPT API:", error);
    return "Une erreur est survenue lors de la réponse de l’IA.";
  }
}
