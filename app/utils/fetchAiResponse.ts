import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "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";
const NEWS_API_KEY = process.env.NEWS_API_KEY || "dd9f970503fd4ac4ad12e26952c7bbed";

// 🔍 Fonction pour récupérer des actualités depuis NewsAPI
async function fetchLatestNews(topic = "technology"): Promise<string[]> {
  try {
    const url = `https://newsapi.org/v2/everything?q=${topic}&sortBy=publishedAt&language=fr&pageSize=5&apiKey=${NEWS_API_KEY}`;
    
    console.log("🔍 Récupération des news depuis NewsAPI...");
    const response = await axios.get(url);
    
    if (!response.data.articles || response.data.articles.length === 0) {
      console.warn("⚠️ Aucun article trouvé");
      return ["Aucune actualité trouvée pour ce sujet."];
    }

    const articles = response.data.articles.map((article: any) => {
      const title = article.title || "Titre inconnu";
      const source = article.source?.name || "Source inconnue";
      const description = article.description ? ` - ${article.description.substring(0, 100)}...` : "";
      return `• ${title} (${source})${description}`;
    });

    console.log(`✅ ${articles.length} articles récupérés`);
    return articles;

  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des news:", error.message);
    if (error.response?.status === 429) {
      return ["⏳ Limite de requêtes NewsAPI atteinte. Réessayez plus tard."];
    }
    if (error.response?.status === 401) {
      return ["🔐 Clé API NewsAPI invalide ou expirée."];
    }
    return ["❌ Erreur lors de la récupération des actualités."];
  }
}

// 🤖 Fonction principale pour envoyer un prompt à OpenAI
export async function fetchAiResponse(prompt: string): Promise<string> {
  try {
    console.log("→ Traitement du prompt:", prompt.substring(0, 50) + "...");

    let finalPrompt = prompt;

    // 🔁 Détection plus flexible pour les demandes d'actualités
    const newsKeywords = ["news", "actualité", "actualités", "dernières", "récent", "nouveau"];
    const containsNewsRequest = newsKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );

    if (containsNewsRequest) {
      console.log("📰 Demande d'actualités détectée");
      
      // Extraction du sujet si spécifié
      let topic = "technology";
      if (prompt.toLowerCase().includes("tech")) topic = "technology";
      else if (prompt.toLowerCase().includes("sport")) topic = "sports";
      else if (prompt.toLowerCase().includes("politique")) topic = "politics";
      else if (prompt.toLowerCase().includes("économie")) topic = "business";

      const newsList = await fetchLatestNews(topic);
      
      if (newsList.length > 0 && !newsList[0].includes("Erreur") && !newsList[0].includes("Aucune")) {
        const newsContent = newsList.join("\n");
        finalPrompt = `Voici les dernières actualités sur ${topic}:\n\n${newsContent}\n\nPeux-tu faire un résumé informatif et engageant de ces actualités en français ?`;
        console.log("✅ Prompt enrichi avec les actualités");
      } else {
        console.warn("⚠️ Pas d'actualités récupérées, utilisation du prompt original");
      }
    }

    console.log("🤖 Envoi à OpenAI...");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant IA français qui fournit des réponses claires et utiles. Quand tu présentes des actualités, fais-le de manière engageante et structurée."
          },
          {
            role: "user",
            content: finalPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 secondes timeout
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      console.error("❌ Réponse vide de OpenAI");
      return "Désolé, je n'ai pas pu générer une réponse.";
    }

    console.log("✅ Réponse OpenAI reçue");
    return aiResponse;

  } catch (error: any) {
    console.error("❌ Erreur complète:", error);

    if (axios.isAxiosError(error)) {
      // Erreurs spécifiques à OpenAI
      if (error.response?.status === 429) {
        console.warn("🚨 Limite de requêtes OpenAI atteinte");
        return "⏳ Trop de requêtes envoyées à OpenAI. Veuillez patienter quelques instants.";
      }
      
      if (error.response?.status === 401) {
        console.warn("🔐 Clé API OpenAI invalide");
        return "🔐 Clé API OpenAI invalide ou expirée.";
      }
      
      if (error.response?.status === 403) {
        console.warn("🚫 Accès refusé OpenAI");
        return "🚫 Accès refusé par OpenAI. Vérifiez vos permissions.";
      }

      if (error.code === 'ECONNABORTED') {
        console.warn("⏰ Timeout de requête");
        return "⏰ La requête a pris trop de temps. Réessayez.";
      }

      if (error.message === "Network Error") {
        console.warn("🌐 Erreur réseau");
        return "🌐 Problème de connexion réseau.";
      }

      // Log détaillé pour debug
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
    }

    return "❌ Une erreur inattendue s'est produite. Réessayez plus tard.";
  }
}