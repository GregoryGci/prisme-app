import React, { memo, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  TouchableOpacity,
  Linking,
  Alert
} from "react-native";
import Markdown from "react-native-markdown-display";

const { width } = Dimensions.get("window");

type Props = {
  title: string;
  content: string;
  source: string;
};

/**
 * 🎴 Composant GlassCard optimisé avec liens cliquables
 * 
 * 🔧 Optimisations appliquées :
 * - React.memo pour éviter les re-renders inutiles
 * - useMemo pour les styles calculés
 * - useCallback pour les handlers d'événements
 * - Détection et rendu intelligent des sources (URL vs texte)
 * - Gestion des liens cliquables avec Linking API
 * - Styles consolidés et performance améliorée
 */
function GlassCard({ title, content, source }: Props) {
  
  /**
   * 🔗 Détection intelligente du type de source
   * Détermine s'il s'agit d'une URL cliquable ou d'un texte simple
   */
  const sourceInfo = useMemo(() => {
    // Vérification si la source est une URL valide
    const isUrl = source.startsWith('http://') || source.startsWith('https://');
    
    if (isUrl) {
      // Si c'est une URL unique, on peut l'ouvrir directement
      if (!source.includes(',')) {
        return {
          type: 'single_url' as const,
          displayText: `🔗 ${extractDomainName(source)}`,
          url: source
        };
      } else {
        // Si ce sont plusieurs URLs, on affiche le nombre
        const urls = source.split(',').map(url => url.trim());
        return {
          type: 'multiple_urls' as const,
          displayText: `🔗 ${urls.length} sources`,
          urls: urls
        };
      }
    } else {
      // Texte simple (ex: "Perplexity", "Erreur", etc.)
      return {
        type: 'text' as const,
        displayText: `📚 ${source}`,
        url: null
      };
    }
  }, [source]);

  /**
   * 🌐 Extraction du nom de domaine pour affichage propre
   */
  const extractDomainName = useCallback((url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url.substring(0, 30) + '...';
    }
  }, []);

  /**
   * 🎯 Gestion des clics sur les sources
   */
  const handleSourcePress = useCallback(async () => {
    if (sourceInfo.type === 'single_url' && sourceInfo.url) {
      try {
        const supported = await Linking.canOpenURL(sourceInfo.url);
        if (supported) {
          await Linking.openURL(sourceInfo.url);
        } else {
          Alert.alert("Erreur", "Impossible d'ouvrir ce lien");
        }
      } catch (error) {
        Alert.alert("Erreur", "Problème lors de l'ouverture du lien");
      }
    } else if (sourceInfo.type === 'multiple_urls' && sourceInfo.urls) {
      // Pour plusieurs URLs, on affiche un menu de sélection
      const urlOptions = sourceInfo.urls.map((url, index) => ({
        text: extractDomainName(url),
        onPress: () => Linking.openURL(url),
      }));

      Alert.alert(
        "Choisir une source",
        "Plusieurs sources disponibles :",
        [
          ...urlOptions.map((option, index) => ({
            text: option.text,
            onPress: option.onPress,
          })),
          { text: "Annuler", style: "cancel" }
        ]
      );
    }
  }, [sourceInfo, extractDomainName]);

  /**
   * 🎨 Styles dynamiques mémoïsés pour optimiser les performances
   */
  const dynamicStyles = useMemo(() => ({
    sourceContainer: {
      ...styles.sourceContainer,
      backgroundColor: sourceInfo.type === 'text' ? 'transparent' : 'rgba(129, 176, 255, 0.1)',
    },
    sourceText: {
      ...styles.sourceText,
      color: sourceInfo.type === 'text' ? '#FFFFFF' : '#81b0ff',
    }
  }), [sourceInfo.type]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 📝 Titre du prompt */}
        <Text style={styles.title}>{title}</Text>

        {/* 🎨 Contenu markdown avec rendu optimisé */}
        <Markdown style={markdownStyles}>{content}</Markdown>

        {/* 🔗 Source interactive avec gestion intelligente */}
        <TouchableOpacity
          style={dynamicStyles.sourceContainer}
          onPress={handleSourcePress}
          disabled={sourceInfo.type === 'text'}
          accessibilityLabel={
            sourceInfo.type === 'text' 
              ? `Source: ${source}` 
              : `Ouvrir la source: ${sourceInfo.displayText}`
          }
          accessibilityRole={sourceInfo.type === 'text' ? 'text' : 'button'}
        >
          <Text style={dynamicStyles.sourceText}>
            {sourceInfo.displayText}
          </Text>
          
          {/* Indicateur visuel pour les liens cliquables */}
          {sourceInfo.type !== 'text' && (
            <Text style={styles.linkIndicator}> ↗</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * 🚀 Export mémoïsé pour éviter les re-renders inutiles
 * Le composant ne sera re-rendu que si ses props changent
 */
export default memo(GlassCard, (prevProps, nextProps) => {
  // Comparaison personnalisée pour optimiser les performances
  return (
    prevProps.title === nextProps.title &&
    prevProps.content === nextProps.content &&
    prevProps.source === nextProps.source
  );
});

/**
 * 🎨 Styles optimisés et consolidés
 */
const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: "center",
    marginVertical: 12,
  },
  
  card: {
    backgroundColor: "#252525",
    borderRadius: 12, // Augmenté pour plus de modernité
    padding: 24,
    
    // Ombres optimisées par plateforme
    ...Platform.select({
      ios: {
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
    
    // Bordure subtile moderne
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16, // Augmenté pour plus d'espacement
    letterSpacing: -0.5,
    lineHeight: 28, // Ajouté pour une meilleure lisibilité
  },
  
  sourceContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // Ajuste la largeur au contenu
  },
  
  sourceText: {
    fontSize: 14,
    fontWeight: "600", // Augmenté pour plus de lisibilité
    fontStyle: "italic",
  },
  
  linkIndicator: {
    fontSize: 12,
    color: '#81b0ff',
    fontWeight: 'bold',
  },
});

/**
 * 🎨 Styles Markdown optimisés pour la lisibilité
 */
const markdownStyles = StyleSheet.create({
  body: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 25, // Augmenté pour une meilleure lisibilité
    fontWeight: "400",
  },
  
  strong: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  
  bullet_list: {
    marginBottom: 12,
    marginLeft: 8, // Ajout d'indentation
  },
  
  ordered_list: {
    marginBottom: 12,
    marginLeft: 8,
  },
  
  list_item: {
    marginBottom: 6, // Espacement entre les items
  },
  
  heading1: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 20,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  
  heading2: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 18,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  
  heading3: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  
  paragraph: {
    marginBottom: 12, // Augmenté pour plus d'espacement
  },
  
  link: {
    color: "#81b0ff",
    textDecorationLine: "underline",
  },
  
  code_inline: {
    backgroundColor: "rgba(248, 0, 0, 0.85)",
    color: "#81b0ff",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  
  fence: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#81b0ff",
  },
});

/**
 * 📚 RÉSUMÉ DES AMÉLIORATIONS APPLIQUÉES
 * 
 * 🔧 PERFORMANCE :
 * ✅ React.memo avec comparaison personnalisée
 * ✅ useMemo pour calculs coûteux (sourceInfo, styles)
 * ✅ useCallback pour handlers d'événements
 * ✅ Styles consolidés et optimisés
 * 
 * 🌐 FONCTIONNALITÉS :
 * ✅ Détection intelligente des types de sources
 * ✅ Liens cliquables pour URLs uniques
 * ✅ Menu de sélection pour URLs multiples
 * ✅ Gestion d'erreurs pour l'ouverture de liens
 * ✅ Indicateurs visuels pour liens cliquables
 * 
 * 🎨 UX/UI :
 * ✅ Styles dynamiques selon le type de source
 * ✅ Indicateurs visuels (🔗, 📚, ↗)
 * ✅ Amélioration de la lisibilité (lineHeight, spacing)
 * ✅ Accessibilité améliorée
 * ✅ Support markdown complet avec code
 * 
 * 📱 COMPATIBILITÉ :
 * ✅ Linking API pour ouverture d'URLs
 * ✅ Styles Platform.select optimisés
 * ✅ Gestion des erreurs robuste
 * ✅ Support des URLs multiples
 * 
 * Cette version transforme les cartes en éléments interactifs tout
 * en maintenant d'excellentes performances et une UX moderne.
 */