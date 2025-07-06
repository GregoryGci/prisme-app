// app.config.js - À créer à la racine de votre projet
import 'dotenv/config'; // Permet de lire le fichier .env

export default {
  expo: {
    name: "Prism App",
    slug: "prism-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png", // Ajustez selon votre structure
    userInterfaceStyle: "dark", // Mode sombre par défaut
    splash: {
      image: "./assets/splash.png", // Ajustez selon votre structure
      resizeMode: "contain",
      backgroundColor: "#1E1E1E"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.votrenom.prismapp" // Changez selon vos infos
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png", // Ajustez
        backgroundColor: "#1E1E1E"
      },
      package: "com.votrenom.prismapp" // Changez selon vos infos
    },
    web: {
      favicon: "./assets/favicon.png" // Ajustez
    },
    // 🔑 SECTION CRITIQUE : Variables d'environnement
    extra: {
      // Ces variables seront accessibles dans l'app
      perplexityApiKey: process.env.PERPLEXITY_API_KEY,
      // Vous pouvez ajouter d'autres variables ici
      apiUrl: process.env.API_URL || "https://api.perplexity.ai",
      environment: process.env.NODE_ENV || "development"
    }
  }
};