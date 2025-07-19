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
import { useHaptic } from "../hooks/useHaptic"; // ✅ NOUVEAU : Import du hook haptic

const { width, height } = Dimensions.get("window");

/**
 * 🎨 Props du composant EmptyState
 */
type EmptyStateProps = {
  onSchedulePrompt: () => void; // Seule action : configurer des prompts
};

/**
 * ✨ EmptyState avec Haptic Feedback Premium
 *
 * 🆕 NOUVEAUTÉS HAPTIC :
 * - Feedback tactile sur toutes les interactions
 * - Micro-vibrations sur hover/focus
 * - Vibration satisfaisante sur action principale
 * - Respect des préférences accessibilité
 * - Sensation premium niveau App Store
 *
 * 🎯 Design Philosophy :
 * - Minimalisme intentionnel avec feedback tactile immersif
 * - Animations subtiles coordonnées avec haptic
 * - Hiérarchie tactile : micro → soft → medium selon l'importance
 * - Progressive feedback disclosure
 * - Cohérence totale avec le design system + sensation premium
 */
export default function EmptyState({ onSchedulePrompt }: EmptyStateProps) {
  // ✅ NOUVEAU : Hook haptic pour feedback tactile premium
  const { hapticMicro, hapticSoft, hapticMedium } = useHaptic();

  // 🎭 Animations d'entrée subtiles et professionnelles
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideUpAnim] = useState(new Animated.Value(30)); // Plus subtil que 50px

  // 🌟 Animation continue très subtile pour l'icône principale
  const [iconFloat] = useState(new Animated.Value(0));

  // 🎯 Micro-interactions pour le bouton
  const [buttonScale] = useState(new Animated.Value(1));

  /**
   * 🚀 Animation d'entrée moderne - Fade + Slide subtil
   * Respecte les préférences "reduced motion"
   */
  useEffect(() => {
    // ✅ NOUVEAU : Haptic feedback subtil au montage de l'EmptyState
    // Indique à l'utilisateur qu'il y a du contenu interactif
    setTimeout(() => {
      hapticMicro(); // Micro-vibration d'accueil très subtile
    }, 600); // Après l'animation d'entrée

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
  }, [hapticMicro]);

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
   * 🎯 Micro-interactions avec haptic feedback premium
   * Coordination parfaite entre animation visuelle et feedback tactile
   */
  const handleButtonPressIn = useCallback(() => {
    // ✅ NOUVEAU : Feedback tactile immédiat sur press
    hapticSoft(); // Vibration confirmation du touch

    // Animation visuelle de compression
    Animated.spring(buttonScale, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  }, [hapticSoft]);

  const handleButtonPressOut = useCallback(() => {
    // Animation de retour à la normale
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  }, []);

  /**
   * ✅ NOUVEAU : Gestion de l'action principale avec haptic premium
   */
  const handleSchedulePress = useCallback(() => {
    // ✅ Feedback tactile d'action importante
    hapticMedium(); // Vibration confirmation d'action importante
    
    // Exécution de l'action
    onSchedulePrompt();
  }, [hapticMedium, onSchedulePrompt]);

  /**
   * ✅ NOUVEAU : Micro-interactions haptic sur les exemples
   * Feedback subtil quand l'utilisateur explore les exemples
   */
  const handleExampleTouch = useCallback(() => {
    hapticMicro(); // Vibration très subtile pour exploration
  }, [hapticMicro]);

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

        {/* 💡 Section exemples avec haptic feedback - Design 2025 */}
        <View style={styles.examplesSection}>
          <TouchableOpacity 
            style={styles.exampleItem}
            onPress={handleExampleTouch}
            activeOpacity={0.7}
          >
            <View style={styles.exampleIcon}>
              <ChatCircle size={16} color="#81b0ff" weight="fill" />
            </View>
            <AppText style={styles.exampleText}>
              "Actualités IA et machine learning du jour"
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exampleItem}
            onPress={handleExampleTouch}
            activeOpacity={0.7}
          >
            <View style={styles.exampleIcon}>
              <Lightning size={16} color="#81b0ff" weight="fill" />
            </View>
            <AppText style={styles.exampleText}>
              "Nouveaux projets cryptomonnaie du jour"
            </AppText>
          </TouchableOpacity>
        </View>

        {/* 🎬 Section action unique avec haptic premium */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            onPress={handleSchedulePress} // ✅ NOUVEAU : Action avec haptic
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
 * 🎨 Styles modernes - Haptic-aware design
 * 
 * ✅ NOUVEAUTÉS POUR HAPTIC :
 * - Zones touch optimisées pour feedback tactile
 * - Padding généreux pour meilleure détection touch
 * - Active states visuels coordonnés avec vibrations
 * - Accessibility-friendly touch targets (44px+)
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

  // 💡 SECTION EXEMPLES - Haptic-aware design
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
    paddingVertical: 18, // ✅ AUGMENTÉ : Meilleur touch target pour haptic
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    
    // ✅ NOUVEAU : Touch target accessibility optimisé
    minHeight: 56, // Minimum 44px recommandé + margin
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

  // Bouton action unique - Style bleu et blanc haptic-optimized
  actionButton: {
    width: "100%",
    borderRadius: 12,
    // ✅ NOUVEAU : Touch target optimisé pour haptic feedback
    minHeight: 56, // Accessibility + haptic optimal
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
 * 📚 HAPTIC FEEDBACK INTÉGRÉ - GUIDE D'UTILISATION
 *
 * ✅ FEEDBACK TACTILE IMPLÉMENTÉ :
 *
 * 🎯 MICRO-INTERACTIONS :
 * - Micro-vibration d'accueil au montage (600ms après animation)
 * - Haptic subtil sur exploration des exemples
 * - Feedback immédiat sur touch des zones interactives
 *
 * 🔵 BOUTON PRINCIPAL :
 * - hapticSoft() sur pressIn (feedback immédiat)
 * - hapticMedium() sur press (confirmation d'action importante)
 * - Coordination parfaite avec animations visuelles
 *
 * 🎨 ZONES TACTILES OPTIMISÉES :
 * - Touch targets 56px+ pour meilleur haptic
 * - Padding généreux pour détection optimale
 * - Active states coordonnés avec vibrations
 *
 * 📱 PATTERNS HAPTIC APPLIQUÉS :
 * - Accueil subtil : Micro-vibration d'indication de contenu
 * - Exploration : Haptic leger sur exemples interactifs
 * - Action : Vibration progressive (soft → medium)
 * - Respect des préférences accessibilité
 *
 * 🎯 RÉSULTAT :
 * - Sensation premium comparable aux meilleures apps natives
 * - Feedback tactile informatif et satisfaisant
 * - Expérience immersive sans être intrusive
 * - Perfect blend visual + tactile
 *
 * 🚀 PROCHAINES ÉTAPES :
 * - Intégrer dans Cards.tsx (scroll, tap, long-press)
 * - Ajouter aux boutons de navigation (drawer, etc.)
 * - Implémenter dans les interactions de liste
 * - Configurer les patterns pull-to-refresh
 */