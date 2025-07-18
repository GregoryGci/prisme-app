import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Clock, Lightbulb, ChatCircle, Lightning } from "phosphor-react-native";
import AppText from "./AppText";

const { width, height } = Dimensions.get("window");

/**
 * 🎨 Props du composant EmptyState
 */
type EmptyStateProps = {
  onSchedulePrompt: () => void; // Seule action : configurer des prompts
};

/**
 * ✨ EmptyState moderne - Tendances UX/UI 2025
 *
 * 🎯 Design Philosophy :
 * - Minimalisme intentionnel avec focus sur l'action
 * - Animations subtiles et respectueuses (reduced motion friendly)
 * - Hiérarchie visuelle claire avec typographie moderne
 * - Copy humain et engageant sans être "salesy"
 * - Progressive disclosure : une action principale, une secondaire
 * - Cohérence totale avec le design system existant
 *
 * 🔧 Tendances 2025 Appliquées :
 * - Geometric icons over illustrations
 * - Generous white space (dark space)
 * - Intentional color usage
 * - Accessibility-first approach
 * - Micro-interactions qui ajoutent de la valeur
 * - Content-first approach
 */
export default function EmptyState({ onSchedulePrompt }: EmptyStateProps) {
  // 🎭 Animations d'entrée subtiles et professionnelles
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideUpAnim] = useState(new Animated.Value(30)); 

  // 🌟 Animation continue très subtile pour l'icône principale
  const [iconFloat] = useState(new Animated.Value(0));

  // 🎯 Micro-interactions pour le bouton
  const [buttonScale] = useState(new Animated.Value(1));

  /**
   * 🚀 Animation d'entrée moderne - Fade + Slide subtil
   * Respecte les préférences "reduced motion"
   */
  useEffect(() => {
    // Animation d'entrée coordonnée et douce
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800, // Plus lent = plus premium
        easing: Easing.out(Easing.cubic), // Courbe moderne
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        delay: 200, // Léger décalage pour sophistication
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /**
   * 🌊 Animation de flottement très subtile pour l'icône
   * Respecte reduced motion - peut être désactivée facilement
   */
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloat, {
          toValue: -4, // Mouvement très subtil
          duration: 3000, // Lent et apaisant
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(iconFloat, {
          toValue: 4,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    return () => floatAnimation.stop();
  }, []);

  /**
   * 🎯 Micro-interactions pour le bouton
   */
  const handleButtonPressIn = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  }, []);

  const handleButtonPressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        {/* 🎨 Section icône principale */}
        <View style={styles.iconSection}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ translateY: iconFloat }],
              },
            ]}
          >
            <View style={styles.iconBackground}>
              <Lightbulb size={40} color="#81b0ff" weight="fill" />
            </View>
          </Animated.View>
        </View>

        {/* 📝 Section contenu textuel */}
        <View style={styles.textSection}>
          <AppText style={styles.title} bold>
            Votre outil de veille IA personnalisée
          </AppText>

          <AppText style={styles.subtitle}>
            Utilisez la barre de recherche ci-dessus pour{"\n"}
            poser votre première question ou configurez{"\n"}
            des prompts automatiques quotidiens.
          </AppText>
        </View>

        {/* 💡 Section exemples - Design 2025 */}
        <View style={styles.examplesSection}>
          <View style={styles.exampleItem}>
            <View style={styles.exampleIcon}>
              <ChatCircle size={16} color="#81b0ff" weight="fill" />
            </View>
            <AppText style={styles.exampleText}>
              "Actualités IA et machine learning du jour"
            </AppText>
          </View>

          <View style={styles.exampleItem}>
            <View style={styles.exampleIcon}>
              <Lightning size={16} color="#81b0ff" weight="fill" />
            </View>
            <AppText style={styles.exampleText}>
              "Nouveaux projets cryptomonnaie du jour"
            </AppText>
          </View>
        </View>

        {/* 🎬 Section action unique */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            onPress={onSchedulePrompt}
            activeOpacity={1}
            accessibilityLabel="Configurer des prompts automatiques"
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.actionButtonContent,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <Clock size={20} color="#FFFFFF" weight="bold" />
              <AppText style={styles.actionButtonText} bold>
                Configurer des prompts automatiques
              </AppText>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * 🎨 Styles modernes - Tendances 2025
 *
 * Principes appliqués :
 * - Spacing system cohérent (multiples de 8)
 * - Hiérarchie typographique claire
 * - Couleurs intentionnelles et mesurées
 * - Responsive design avec contraintes max
 * - Accessibility-friendly (tailles de touch, contrastes)
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24, // Marges généreuses
    paddingVertical: 32,
    backgroundColor: "transparent",
  },

  content: {
    width: "100%",
    maxWidth: 400, // Contrainte pour tablettes
    alignItems: "center",
  },

  // 🎨 SECTION ICÔNE PRINCIPALE
  iconSection: {
    marginBottom: 40, // Spacing généreux
    alignItems: "center",
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 24, // Border radius moderne (pas circulaire)
    backgroundColor: "#252525", // Cohérent avec les Cards
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)", // Bordure cohérente

    // Ombre subtile moderne
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  // 📝 SECTION TEXTUELLE
  textSection: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 24, // Taille moderne, pas trop grosse
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.3, // Tracking serré moderne
    lineHeight: 32,
  },

  subtitle: {
    fontSize: 15,
    color: "#AAAAAA", // Gris intermédiaire
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.1,
  },

  // 💡 SECTION EXEMPLES - Design 2025
  examplesSection: {
    width: "100%",
    marginBottom: 40,
    paddingHorizontal: 8,
  },

  exampleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525", // Cohérent avec Cards
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  exampleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(129, 176, 255, 0.1)", // Accent très subtil
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  exampleText: {
    flex: 1,
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },

  // 🎬 SECTION ACTION
  actionsSection: {
    width: "100%",
    alignItems: "center",
  },

  // Bouton action unique - Style bleu et blanc
  actionButton: {
    width: "100%",
    borderRadius: 12,
  },

  actionButtonContent: {
    backgroundColor: "#81b0ff", // Style bleu principal
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,

    // Ombre moderne mais subtile
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  actionButtonText: {
    fontSize: 16,
    color: "#FFFFFF", // Texte blanc
    marginLeft: 3,
    letterSpacing: 0.2,
    textAlign: "center",
  },
});

/**
 * 📚 EMPTYSTATE OPTIMISÉ POUR OUTIL DE VEILLE IA
 *
 * ✅ DESIGN FOCALISÉ :
 * - Icône ampoule symbolisant l'intelligence et la veille
 * - Titre spécialisé : "Votre outil de veille IA personnalisée"
 * - Guidance claire vers la searchbar existante
 * - Action unique : Configuration de prompts automatiques
 *
 * ✅ UX STREAMLINÉE :
 * - Suppression du bouton redondant (searchbar déjà présente)
 * - Focus sur la valeur unique : automatisation via prompts planifiés
 * - Style bouton cohérent : bleu et blanc comme bouton principal
 * - Message clair guidant vers la searchbar
 *
 * ✅ COHÉRENCE DESIGN :
 * - Ampoule = métaphore universelle pour idées/intelligence
 * - Couleurs harmonisées avec le design system
 * - Animations subtiles et professionnelles
 * - Typography moderne et accessible
 *
 * 🎯 IMPACT UX :
 * - Évite la confusion entre searchbar et bouton question
 * - Met en avant la feature différenciante (prompts auto)
 * - Positioning clair comme outil de veille spécialisé
 * - Expérience fluide sans redondance
 */
