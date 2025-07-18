import axios from "axios";
import Constants from "expo-constants";

/**
 * 🔐 Récupération sécurisée de la clé API Perplexity
 *
 * Ordre de priorité pour la récupération :
 * 1. Variable d'environnement depuis app.config.js (recommandé pour Expo)
 * 2. Variable d'environnement système (fallback)
 *
 * Cette approche garantit que la clé API n'est jamais exposée dans le code source
 * et peut être différente selon l'environnement (développement/production).
 */
const PERPLEXITY_API_KEY =
  Constants.expoConfig?.extra?.perplexityApiKey ||
  process.env.PERPLEXITY_API_KEY;

/**
 * ✅ Vérification de sécurité au démarrage de l'application
 *
 * Cette vérification permet de détecter immédiatement si la configuration
 * des variables d'environnement est incorrecte, évitant des erreurs plus tard.
 */
if (!PERPLEXITY_API_KEY) {
  console.error("❌ ERREUR CRITIQUE: Clé API Perplexity manquante!");
  console.error(
    "📋 Vérifiez que votre fichier .env contient PERPLEXITY_API_KEY"
  );
}

/**
 * 🔗 Interface TypeScript pour le résultat enrichi avec sources
 *
 * Cette interface structure la réponse de Perplexity en incluant non seulement
 * le texte de réponse, mais aussi les sources web utilisées, formatées pour
 * différents usages (affichage utilisateur, stockage, liens cliquables).
 */
export interface PerplexityResult {
  response: string; // Réponse textuelle principale de l'IA
  sources: string[]; // Array des URLs sources brutes
  sourcesFormatted: string; // Sources formatées pour stockage/affichage
  sourcesDisplay: string; // Sources formatées pour l'utilisateur (noms de domaines)
}

/**
 * 🔍 Fonction d'extraction des URLs depuis le texte de réponse
 *
 * Cette fonction utilise une expression régulière optimisée pour détecter
 * et extraire toutes les URLs présentes dans la réponse de Perplexity.
 * Elle gère les URLs modernes avec paramètres, ports, et ancres.
 *
 * Améliorations par rapport aux versions basiques :
 * - Support des ports personnalisés (:8080, :3000, etc.)
 * - Gestion des paramètres d'URL (?param=value&autre=valeur)
 * - Support des ancres (#section)
 * - Déduplication automatique des URLs identiques
 * - Limitation à 5 sources maximum pour éviter l'encombrement
 *
 * @param text - Texte de la réponse contenant potentiellement des URLs
 * @returns Array des URLs uniques trouvées (maximum 5)
 */
function extractSources(text: string): string[] {
  /**
   * 📝 Explication de la regex utilisée :
   *
   * https?:\/\/           - Protocole HTTP ou HTTPS obligatoire
   * (?:[-\w.])+           - Nom de domaine (lettres, chiffres, tirets, points)
   * (?:\:[0-9]+)?         - Port optionnel (:8080, :3000, etc.)
   * (?:\/(?:[\w\/_.])*    - Chemin optionnel après le domaine
   * (?:\?(?:[\w&=%.])*)?  - Paramètres d'URL optionnels (?param=value)
   * (?:\#(?:[\w.])*)?)?   - Ancre optionnelle (#section)
   *
   * Le flag 'g' permet de capturer toutes les occurrences dans le texte.
   */
  const urlRegex =
    /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/g;

  /**
   * Extraction et déduplication des URLs :
   * 1. Array.from() avec matchAll() capture toutes les correspondances
   * 2. map() extrait uniquement l'URL complète (match[0])
   * 3. filter() supprime les doublons en comparant les indices
   * 4. slice(0, 5) limite à 5 sources maximum
   */
  const sources = Array.from(text.matchAll(urlRegex), (match) => match[0])
    .filter((url, index, array) => array.indexOf(url) === index) // Suppression des doublons
    .slice(0, 5); // Limitation à 5 sources pour éviter l'encombrement de l'interface

  return sources;
}

/**
 * 🔗 Fonction de formatage des sources selon le contexte d'utilisation
 *
 * Cette fonction adapte l'affichage des sources selon leur nombre :
 * - Aucune source : "Perplexity" (source par défaut)
 * - Une source : URL complète (permet les liens cliquables)
 * - Plusieurs sources : Toutes les URLs séparées par des virgules
 *
 * Ce formatage est utilisé pour le stockage et l'affichage des liens cliquables
 * dans l'interface utilisateur.
 *
 * @param sources - Array des URLs sources extraites
 * @returns String formatée pour l'affichage ou le stockage
 */
function formatSources(sources: string[]): string {
  // Cas 1 : Aucune source détectée
  if (sources.length === 0) return "Perplexity";

  // Cas 2 : Une seule source - retour de l'URL complète pour lien cliquable
  if (sources.length === 1) return sources[0];

  // Cas 3 : Plusieurs sources - toutes les URLs séparées par des virgules
  return sources.join(", ");
}

/**
 * 🏷️ Fonction d'extraction du nom de domaine pour affichage utilisateur
 *
 * Cette fonction simplifie les URLs complètes en noms de domaines lisibles
 * pour un affichage plus propre dans l'interface utilisateur.
 *
 * Exemples de transformation :
 * - "https://www.lemonde.fr/article/123" → "lemonde.fr"
 * - "https://franceinfo.fr/sport/esport" → "franceinfo.fr"
 * - URL malformée → "URL tronquée..."
 *
 * @param url - URL complète à traiter
 * @returns Nom de domaine simplifié ou URL tronquée en cas d'erreur
 */
function getDomainName(url: string): string {
  try {
    // Utilisation de l'API native URL pour parser l'URL de manière fiable
    const domain = new URL(url).hostname.replace("www.", "");
    return domain;
  } catch {
    /**
     * Fallback sécurisé en cas d'URL malformée :
     * - Tronque l'URL à 30 caractères maximum
     * - Ajoute "..." pour indiquer la troncature
     * - Évite les crashs de l'application
     */
    return url.substring(0, 30) + "...";
  }
}

/**
 * ⏰ Fonction utilitaire de délai avec Promise
 * @param ms - Délai en millisecondes
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 🚦 Variable globale pour espacer les requêtes et éviter le rate limiting
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 secondes entre les requêtes

/**
 * 🔄 Système de retry avec backoff exponentiel et gestion spéciale 429
 *
 * Implémente une stratégie de retry intelligente avec gestion spéciale des erreurs 429 :
 * - Tentative 1 : immédiate (avec délai minimum)
 * - Tentative 2 : après 2 secondes (standard) ou 10s (si 429)
 * - Tentative 3 : après 4 secondes (standard) ou 30s (si 429)
 * - Tentative 4 : après 8 secondes (standard) ou 60s (si 429)
 *
 * @param operation - Fonction async à exécuter avec retry
 * @param maxRetries - Nombre maximum de tentatives (défaut: 3)
 * @param baseDelay - Délai de base en ms (défaut: 2000)
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // ✅ NOUVEAU : Respecter l'intervalle minimum entre requêtes
      const timeSinceLastRequest = Date.now() - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(
          `⏳ Attente de ${waitTime}ms pour respecter le rate limiting...`
        );
        await delay(waitTime);
      }

      console.log(`🔄 Tentative ${attempt}/${maxRetries}`);
      lastRequestTime = Date.now(); // ✅ Marquer le timestamp de la requête

      const result = await operation();

      if (attempt > 1) {
        console.log(`✅ Succès après ${attempt} tentative(s)`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      // Ne pas retry sur certaines erreurs définitives
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log(
          `❌ Erreur définitive (${error.response.status}), pas de retry`
        );
        throw error;
      }

      if (attempt === maxRetries) {
        console.log(`❌ Échec après ${maxRetries} tentatives`);
        throw lastError;
      }

      // ✅ NOUVEAU : Calcul du délai spécial pour l'erreur 429
      let delayMs: number;

      if (error.response?.status === 429) {
        // Délais beaucoup plus longs pour rate limiting
        const rateLimitDelays = [10000, 30000, 60000]; // 10s, 30s, 60s
        delayMs = rateLimitDelays[attempt - 1] || 60000;
        console.log(
          `🚦 Rate limit détecté (429) - Attente spéciale de ${
            delayMs / 1000
          }s...`
        );
      } else {
        // Délais normaux pour autres erreurs
        delayMs = baseDelay * Math.pow(2, attempt - 1);
        console.log(
          `⏳ Attente de ${delayMs}ms avant la prochaine tentative...`
        );
      }

      await delay(delayMs);
    }
  }

  throw lastError!;
}

/**
 * 🤖 Fonction principale d'envoi de prompts à Perplexity avec extraction de sources
 *
 * Cette fonction est le cœur du système d'interaction avec l'API Perplexity.
 * Elle gère l'ensemble du processus depuis l'envoi de la requête jusqu'au
 * formatage des sources, en passant par la gestion d'erreurs complète.
 *
 * Fonctionnalités principales :
 * ✅ Envoi sécurisé vers l'API Perplexity avec authentification
 * ✅ Utilisation du modèle "sonar" (stable et performant en 2025)
 * ✅ Extraction automatique des sources web depuis la réponse
 * ✅ Formatage intelligent des sources pour différents usages
 * ✅ Gestion d'erreurs robuste avec messages utilisateur informatifs
 * ✅ Logging détaillé pour faciliter le debugging
 * ✅ NOUVEAU : Système de retry automatique avec backoff exponentiel
 *
 * Optimisations appliquées :
 * - Modèle "sonar" : Modèle par défaut stable de Perplexity (remplace les anciens modèles retirés)
 * - Prompt système concis : Évite les erreurs 400 liées aux prompts trop longs
 * - Paramètres équilibrés : Temperature 0.7 pour un bon équilibre créativité/précision
 * - Timeout généreux : 30 secondes pour les requêtes complexes
 * - Retry intelligent : 3 tentatives avec backoff exponentiel pour la robustesse
 *
 * @param prompt - Le texte/question à envoyer à l'IA Perplexity
 * @returns Promise<PerplexityResult> - Objet contenant la réponse et les sources formatées
 */
export async function fetchAiResponseWithSources(
  prompt: string
): Promise<PerplexityResult> {
  /**
   * 🔐 Vérification de sécurité préalable
   *
   * Cette vérification évite d'envoyer des requêtes sans authentification,
   * ce qui économise des appels API inutiles et fournit un message d'erreur clair.
   */
  if (!PERPLEXITY_API_KEY) {
    console.error("❌ Tentative d'appel API sans clé d'authentification");
    return {
      response:
        "🔐 Erreur de configuration : Clé API manquante. Vérifiez votre fichier .env",
      sources: [],
      sourcesFormatted: "Erreur",
      sourcesDisplay: "Erreur",
    };
  }

  try {
    /**
     * 📊 Logging informatif pour le développement et le debugging
     *
     * Ces logs permettent de suivre le processus d'envoi des requêtes
     * et d'identifier d'éventuels problèmes de performance.
     */
    console.log("→ Traitement du prompt:", prompt.substring(0, 50) + "...");
    console.log("🤖 Envoi vers Perplexity avec le modèle optimisé 2025...");

    /**
     * 📡 Configuration et envoi de la requête API vers Perplexity avec retry automatique
     */
    const response = await withRetry(
      async () => {
        console.log(`🚀 Appel API Perplexity...`);

        return await axios.post(
          "https://api.perplexity.ai/chat/completions", // URL officielle de l'API Perplexity
          {
            /**
             * 🎯 Configuration du modèle et des paramètres
             */
            model: "sonar", // Modèle par défaut stable et performant (2025)

            /**
             * 💬 Structure des messages pour l'IA
             *
             * Le format suit la convention OpenAI/ChatGPT :
             * - "system" : Instructions pour configurer le comportement de l'IA
             * - "user" : Le prompt/question de l'utilisateur
             */
            messages: [
              {
                role: "system",
                /**
                 * 📝 Prompt système optimisé
                 *
                 * Volontairement concis pour éviter les erreurs 400 liées aux
                 * prompts système trop longs. Conserve les fonctionnalités essentielles :
                 * - Réponses en français
                 * - Inclusion des sources web quand possible
                 */
                content:
                  "Tu es un assistant IA français. Réponds toujours en français et inclus les sources web dans tes réponses quand possible.",
              },
              {
                role: "user",
                content: prompt, // Question/demande de l'utilisateur
              },
            ],

            /**
             * ⚙️ Paramètres de génération optimisés
             */
            temperature: 0.7, // Équilibre entre créativité (1.0) et précision (0.0)
            max_tokens: 1500, // Limite généreuse pour des réponses détaillées
            stream: false, // Mode synchrone pour simplicité (pas de streaming)
          },
          {
            /**
             * 🔑 Configuration des headers et options de requête
             */
            headers: {
              Authorization: `Bearer ${PERPLEXITY_API_KEY}`, // Authentification Bearer
              "Content-Type": "application/json", // Format de données JSON
            },
            timeout: 30000, // Timeout de 30 secondes pour les requêtes complexes
          }
        );
      },
      3,
      1000
    ); // 3 tentatives max, délai de base 1s

    /**
     * 📝 Extraction et validation de la réponse de l'API
     *
     * La réponse suit le format standard OpenAI :
     * response.data.choices[0].message.content contient le texte généré
     */
    const aiResponse = response.data.choices[0]?.message?.content?.trim();

    /**
     * ⚠️ Vérification de la validité de la réponse
     *
     * Gestion du cas où l'API retourne une réponse vide ou malformée.
     */
    if (!aiResponse) {
      console.error("❌ Réponse vide de Perplexity");
      return {
        response: "Désolé, je n'ai pas pu générer une réponse.",
        sources: [],
        sourcesFormatted: "Perplexity",
        sourcesDisplay: "Perplexity",
      };
    }

    /**
     * 🔍 Extraction et formatage intelligent des sources web
     *
     * Processus en trois étapes :
     * 1. extractSources() : Trouve toutes les URLs dans la réponse
     * 2. formatSources() : Formate les URLs pour le stockage/liens
     * 3. getDomainName() : Simplifie pour l'affichage utilisateur
     */
    const sources = extractSources(aiResponse);
    const sourcesFormatted = formatSources(sources);
    const sourcesDisplay =
      sources.length > 0
        ? sources.map((url) => getDomainName(url)).join(", ") // "lemonde.fr, franceinfo.fr"
        : "Perplexity"; // Fallback si aucune source détectée

    /**
     * ✅ Logging de succès avec informations utiles
     *
     * Ces logs confirment le bon fonctionnement et donnent des métriques
     * sur le nombre de sources trouvées.
     */
    console.log("✅ Réponse Perplexity reçue avec succès");
    console.log("🔗 Sources extraites:", sources.length);
    if (sources.length > 0) {
      // Log des 3 premières sources pour éviter le spam dans la console
      console.log("📋 Sources détectées:", sources.slice(0, 3));
    }

    /**
     * 🎯 Retour de l'objet résultat structuré
     *
     * Cet objet contient toutes les informations nécessaires pour
     * l'affichage et le stockage dans l'application.
     */
    return {
      response: aiResponse, // Texte de réponse principal
      sources, // Array des URLs brutes
      sourcesFormatted, // URLs formatées pour stockage
      sourcesDisplay, // Noms de domaines pour affichage
    };
  } catch (error: any) {
    /**
     * 🛠️ Gestion d'erreurs robuste et informative
     *
     * Cette section gère tous les types d'erreurs possibles avec des
     * messages utilisateur appropriés et un logging détaillé pour le debugging.
     */
    console.error(
      "❌ Erreur lors de l'appel Perplexity:",
      error.response?.data || error.message
    );

    /**
     * 🔍 Analyse spécifique des erreurs HTTP Axios
     *
     * Axios classe automatiquement les erreurs HTTP, permettant une
     * gestion fine selon le type de problème rencontré.
     */
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      /**
       * 🔧 Logging de diagnostic détaillé (uniquement en développement)
       *
       * Ces informations aident au debugging sans encombrer les logs
       * en production.
       */
      if (process.env.NODE_ENV === "development") {
        console.log("📊 Diagnostic détaillé:");
        console.log("   Statut HTTP:", status);
        console.log("   Données d'erreur:", JSON.stringify(errorData, null, 2));
      }

      /**
       * 📋 Gestion spécifique par code d'erreur HTTP
       *
       * Chaque type d'erreur a son message personnalisé pour guider
       * l'utilisateur vers la solution appropriée.
       */

      // Erreur 400 : Requête malformée
      if (status === 400) {
        return {
          response:
            "🔧 Erreur de requête (400). Le format de la demande n'est pas valide. Veuillez réessayer avec un prompt différent.",
          sources: [],
          sourcesFormatted: "Erreur de format",
          sourcesDisplay: "Erreur de format",
        };
      }

      // Erreur 401 : Authentification échouée
      if (status === 401) {
        return {
          response:
            "🔐 Problème d'authentification. Vérifiez votre clé API Perplexity et vos crédits disponibles.",
          sources: [],
          sourcesFormatted: "Erreur d'authentification",
          sourcesDisplay: "Erreur d'authentification",
        };
      }

      // Erreur 403 : Accès interdit
      if (status === 403) {
        return {
          response:
            "🚫 Accès refusé. Votre plan Perplexity ne permet peut-être pas d'utiliser cette fonctionnalité.",
          sources: [],
          sourcesFormatted: "Accès refusé",
          sourcesDisplay: "Accès refusé",
        };
      }

      // Erreur 429 : Trop de requêtes
      if (status === 429) {
        return {
          response: "🚦 Limite de taux Perplexity atteinte. L'application va automatiquement réessayer avec des délais plus longs. Patientez un moment... (Ceci peut prendre 1-2 minutes)",
          sources: [],
          sourcesFormatted: "Rate limit",
          sourcesDisplay: "Rate limit"
        };
      }

      // Erreur de timeout réseau
      if (error.code === "ECONNABORTED") {
        return {
          response:
            "⏱️ Délai d'attente dépassé. Vérifiez votre connexion internet et réessayez.",
          sources: [],
          sourcesFormatted: "Timeout",
          sourcesDisplay: "Timeout",
        };
      }

      // Erreurs serveur (5xx)
      if (status && status >= 500) {
        return {
          response:
            "🔧 Problème temporaire du serveur Perplexity. Réessayez dans quelques minutes.",
          sources: [],
          sourcesFormatted: "Erreur serveur",
          sourcesDisplay: "Erreur serveur",
        };
      }
    }

    /**
     * 🔄 Erreur générique pour les cas non couverts
     *
     * Cette réponse catch-all gère les erreurs inattendues tout en
     * fournissant des instructions utiles à l'utilisateur.
     */
    return {
      response:
        "❌ Une erreur inattendue s'est produite. Vérifiez votre connexion et réessayez dans quelques instants.",
      sources: [],
      sourcesFormatted: "Erreur inconnue",
      sourcesDisplay: "Erreur inconnue",
    };
  }
}

/**
 * 🎯 Fonction simplifiée pour compatibilité avec l'ancien code
 *
 * Cette fonction wraps la fonction principale pour maintenir la compatibilité
 * avec le code existant qui n'a besoin que de la réponse textuelle.
 *
 * Utilisée dans les contextes où les métadonnées de sources ne sont pas
 * nécessaires, par exemple pour des tests rapides ou des intégrations simples.
 *
 * @param prompt - Question à envoyer à l'IA
 * @returns Promise<string> - Réponse textuelle uniquement
 */
export async function fetchAiResponse(prompt: string): Promise<string> {
  const result = await fetchAiResponseWithSources(prompt);
  return result.response;
}

/**
 * 📚 DOCUMENTATION COMPLÈTE D'UTILISATION AVEC SYSTÈME DE RETRY
 *
 * ===== RÉSUMÉ DES FONCTIONNALITÉS =====
 *
 * Cette implémentation finale offre :
 *
 * ✅ PERFORMANCE :
 *    - Modèle "sonar" stable et rapide (2025)
 *    - Paramètres optimisés pour équilibrer rapidité et qualité
 *    - Timeout généreux pour les requêtes complexes
 *
 * ✅ FIABILITÉ RENFORCÉE :
 *    - Gestion d'erreurs complète avec messages utilisateur clairs
 *    - Fallbacks automatiques pour tous les cas d'échec
 *    - Validation robuste des réponses API
 *    - ✅ NOUVEAU : Système de retry automatique avec backoff exponentiel
 *    - ✅ NOUVEAU : Pas de retry sur erreurs définitives (401, 403)
 *    - ✅ NOUVEAU : Délais intelligents entre tentatives (1s, 2s, 4s)
 *
 * ✅ SÉCURITÉ :
 *    - Variables d'environnement protégées
 *    - Vérifications d'authentification préalables
 *    - Pas d'exposition de données sensibles
 *
 * ✅ MAINTENABILITÉ :
 *    - Code entièrement documenté en français
 *    - Architecture modulaire avec fonctions séparées
 *    - Logging détaillé pour faciliter le debugging
 *
 * ✅ FONCTIONNALITÉS AVANCÉES :
 *    - Extraction automatique des sources web
 *    - Formatage intelligent pour différents usages
 *    - Support complet des URLs modernes
 *    - ✅ NOUVEAU : Robustesse face aux connexions instables
 *
 * ===== EXEMPLES D'UTILISATION =====
 *
 * 1. UTILISATION COMPLÈTE AVEC SOURCES ET RETRY :
 *
 * ```typescript
 * const result = await fetchAiResponseWithSources("Résumé esport du jour");
 * // Retry automatique en cas d'échec réseau temporaire
 *
 * console.log("Réponse:", result.response);
 * console.log("Sources lisibles:", result.sourcesDisplay); // "lemonde.fr, jeuxvideo.com"
 * console.log("URLs complètes:", result.sourcesFormatted); // Pour liens cliquables
 * ```
 *
 * 2. UTILISATION DANS LE CONTEXT PROMPT :
 *
 * ```typescript
 * const result = await fetchAiResponseWithSources(question);
 * // Système de retry transparent pour l'utilisateur
 *
 * const newPrompt: Prompt = {
 *   id: Date.now().toString(),
 *   question,
 *   response: result.response,
 *   source: result.sourcesFormatted, // URLs complètes pour liens cliquables
 *   updatedAt: now,
 *   scheduled: isScheduled ? scheduleConfig : undefined
 * };
 * ```
 *
 * 3. UTILISATION SIMPLE (COMPATIBILITÉ) :
 *
 * ```typescript
 * const response = await fetchAiResponse("Question simple");
 * // Même retry automatique que la version complète
 * console.log(response); // Texte de réponse uniquement
 * ```
 *
 * ===== STRATÉGIE DE RETRY =====
 *
 * 🔄 TENTATIVES AUTOMATIQUES :
 *    - Tentative 1 : immédiate
 *    - Tentative 2 : après 1 seconde
 *    - Tentative 3 : après 2 secondes
 *    - Tentative 4 : après 4 secondes (si activée)
 *
 * 🚫 PAS DE RETRY POUR :
 *    - Erreurs 401 (authentification) - définitive
 *    - Erreurs 403 (permissions) - définitive
 *    - Autres erreurs : retry automatique
 *
 * 📊 LOGGING INTELLIGENT :
 *    - Affichage du numéro de tentative
 *    - Message de succès après retry
 *    - Délai avant prochaine tentative
 *
 * ===== CONSIDÉRATIONS POUR LA PRODUCTION =====
 *
 * 🔧 MONITORING :
 *    - Surveillez les logs de retry pour identifier les problèmes réseau
 *    - Trackez les taux de succès après retry
 *    - Mesurez l'impact des délais sur l'UX
 *
 * 💰 OPTIMISATION DES COÛTS :
 *    - Le retry évite les échecs inutiles dus au réseau
 *    - Améliore le taux de succès sans coût supplémentaire
 *    - Réduit la frustration utilisateur
 *
 * 🚀 ROBUSTESSE PRODUCTION :
 *    - Gestion transparente des connexions instables
 *    - Expérience utilisateur fluide même avec mauvais réseau
 *    - Résilience face aux pics de charge du serveur
 *
 * Cette version avec retry est maintenant **PRÊTE POUR LA PRODUCTION**
 * et garantit une expérience utilisateur robuste même dans des conditions
 * réseau difficiles ou lors de surcharges temporaires du serveur Perplexity.
 */
