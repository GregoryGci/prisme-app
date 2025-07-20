import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Pressable,
} from "react-native";
import Markdown from "react-native-markdown-display";
import AppText from "./AppText";
import { useHaptic } from "../hooks/useHaptic"; // ✅ NOUVEAU : Import haptic

const { width } = Dimensions.get("window");

type Props = {
  title: string;
  content: string;
  source: string;
  isLoading?: boolean;
  index?: number; // Pour l'animation décalée
};

/**
 * 🎴 Cards avec Haptic Feedback Premium
 *
 * 🆕 NOUVEAUTÉS HAPTIC :
 * - Feedback tactile sur toutes les interactions
 * - Micro-vibrations sur exploration du contenu
 * - Haptic différencié selon le type d'action
 * - Long-press avec pattern progressif
 * - Liens avec feedback de confirmation
 *
 * ✨ Animations d'apparition spectaculaires conservées :
 * - Slide + Fade in avec décalage par index
 * - Scale animation au tap coordonnée avec haptic
 * - Entrance animation en 3 phases
 * - Spring physics pour un rendu naturel
 * - Stagger effect pour plusieurs cartes
 */
function Cards({
  title,
  content,
  source,
  isLoading = false,
  index = 0,
}: Props) {
  // ✅ NOUVEAU : Hook haptic pour feedback tactile premium
  const {
    hapticMicro,
    hapticSoft,
    hapticMedium,
    hapticLongPress,
    hapticError,
  } = useHaptic();

  // ✅ États pour les animations d'apparition
  const [cardScale] = useState(new Animated.Value(1));
  const [sourceScale] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  // ✅ Animations d'entrée sophistiquées
  const [slideY] = useState(new Animated.Value(50)); // Démarre 50px plus bas
  const [opacity] = useState(new Animated.Value(0)); // Démarre invisible
  const [scaleEntry] = useState(new Animated.Value(0.9)); // Démarre légèrement réduit

  // ✅ Animation d'entrée en 3 phases
  useEffect(() => {
    const staggerDelay = index * 150; // 150ms de décalage entre chaque carte

    // Phase 1 : Opacity + Scale (simultané)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: staggerDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleEntry, {
        toValue: 1,
        delay: staggerDelay,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2 : Slide Y (légèrement décalée)
    Animated.spring(slideY, {
      toValue: 0,
      delay: staggerDelay + 100,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();

    // ✅ NOUVEAU : Micro-haptic subtil après animation d'entrée
    setTimeout(() => {
      if (index < 3) {
        // Seulement pour les 3 premières cartes
        hapticMicro(); // Indication très subtile de contenu disponible
      }
    }, staggerDelay + 700);
  }, [index, hapticMicro]);

  // ✅ Animation de pulse pour le chargement
  useEffect(() => {
    if (isLoading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isLoading, pulseAnim]);

  /**
   * 🔗 Détection intelligente du type de source
   */
  const sourceInfo = useMemo(() => {
    const isUrl = source.startsWith("http://") || source.startsWith("https://");

    if (isUrl) {
      if (!source.includes(",")) {
        return {
          type: "single_url" as const,
          displayText: `🔗 ${extractDomainName(source)}`,
          url: source,
        };
      } else {
        const urls = source.split(",").map((url) => url.trim());
        return {
          type: "multiple_urls" as const,
          displayText: `🔗 ${urls.length} sources`,
          urls: urls,
        };
      }
    } else {
      return {
        type: "text" as const,
        displayText: `📚 ${source}`,
        url: null,
      };
    }
  }, [source]);

  /**
   * 🌐 Extraction du nom de domaine
   */
  const extractDomainName = useCallback((url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url.substring(0, 30) + "...";
    }
  }, []);

  /**
   * 🎭 Animations de feedback tactile avec haptic coordination
   */
  const handleCardPressIn = useCallback(() => {
    // ✅ NOUVEAU : Haptic feedback immédiat sur touch
    hapticSoft(); // Confirmation du touch

    Animated.spring(cardScale, {
      toValue: 1.003, // Légèrement plus subtil
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  }, [cardScale, hapticSoft]);

  const handleCardPressOut = useCallback(() => {
    // Animation de retour ultra légère
    Animated.sequence([
      Animated.spring(cardScale, {
        toValue: 1.003,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 1000,
        friction: 30,
      }),
    ]).start();
  }, [cardScale]);

  /**
   * ✅ NOUVEAU : Long press avec pattern haptic progressif
   */
  const handleCardLongPress = useCallback(() => {
    // Pattern haptic sophistiqué pour long press
    hapticLongPress(); // Micro → Soft → Medium progressif

    // Ici on pourrait ajouter un menu contextuel ou des actions
    Alert.alert(
      "Actions disponibles",
      "Que voulez-vous faire avec ce prompt ?",
      [
        { text: "Copier le contenu", onPress: () => hapticSoft() },
        { text: "Partager", onPress: () => hapticSoft() },
        { text: "Annuler", style: "cancel", onPress: () => hapticMicro() },
      ]
    );
  }, [hapticLongPress, hapticSoft, hapticMicro]);

  const handleSourcePressIn = useCallback(() => {
    if (sourceInfo.type !== "text") {
      // ✅ NOUVEAU : Haptic pour interaction avec source
      hapticMicro(); // Micro-feedback pour zone secondaire

      Animated.spring(sourceScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }).start();
    }
  }, [sourceScale, sourceInfo.type, hapticMicro]);

  const handleSourcePressOut = useCallback(() => {
    if (sourceInfo.type !== "text") {
      Animated.sequence([
        Animated.spring(sourceScale, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 400,
          friction: 8,
        }),
        Animated.spring(sourceScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 400,
          friction: 8,
        }),
      ]).start();
    }
  }, [sourceScale, sourceInfo.type]);

  /**
   * 🎯 Gestion des clics sur les sources avec haptic feedback
   */
  const handleSourcePress = useCallback(async () => {
    if (sourceInfo.type === "single_url" && sourceInfo.url) {
      try {
        // ✅ NOUVEAU : Haptic de confirmation avant ouverture du lien
        hapticMedium(); // Action importante confirmée

        const supported = await Linking.canOpenURL(sourceInfo.url);
        if (supported) {
          await Linking.openURL(sourceInfo.url);
        } else {
          // ✅ NOUVEAU : Haptic d'erreur si lien non supporté
          setTimeout(() => hapticError(), 100);
          Alert.alert("Erreur", "Impossible d'ouvrir ce lien");
        }
      } catch (error) {
        // ✅ NOUVEAU : Haptic d'erreur en cas de problème
        setTimeout(() => hapticError(), 100);
        Alert.alert("Erreur", "Problème lors de l'ouverture du lien");
      }
    } else if (sourceInfo.type === "multiple_urls" && sourceInfo.urls) {
      // ✅ NOUVEAU : Haptic pour ouverture du sélecteur de sources
      hapticSoft(); // Feedback d'ouverture de menu

      const urlOptions = sourceInfo.urls.map((url, index) => ({
        text: extractDomainName(url),
        onPress: () => {
          hapticMedium(); // Confirmation de sélection
          Linking.openURL(url);
        },
      }));

      Alert.alert("Choisir une source", "Plusieurs sources disponibles :", [
        ...urlOptions.map((option, index) => ({
          text: option.text,
          onPress: option.onPress,
        })),
        {
          text: "Annuler",
          style: "cancel",
          onPress: () => hapticMicro(), // Feedback discret d'annulation
        },
      ]);
    }
  }, [sourceInfo, extractDomainName, hapticMedium, hapticSoft, hapticMicro]);

  /**
   * 🎨 Styles dynamiques avec support des animations
   */
  const dynamicStyles = useMemo(
    () => ({
      sourceContainer: {
        ...styles.sourceContainer,
        backgroundColor:
          sourceInfo.type === "text"
            ? "transparent"
            : "rgba(129, 176, 255, 0.08)",
      },
      sourceText: {
        ...styles.sourceText,
        color: sourceInfo.type === "text" ? "#888" : "#81b0ff",
      },
    }),
    [sourceInfo.type]
  );

  return (
    <View style={styles.container}>
      {/* ✅ Card animée avec haptic feedback complet */}
      <Pressable
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        onLongPress={handleCardLongPress} // ✅ NOUVEAU : Long press avec pattern haptic
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity, // ✅ Fade in
              transform: [
                { translateY: slideY }, // ✅ Slide in from bottom
                { scale: Animated.multiply(cardScale, scaleEntry) }, // ✅ Scale combiné
                { scale: isLoading ? pulseAnim : 1 }, // ✅ Pulse si loading
              ],
            },
          ]}
        >
          {/* ✅ Indicateur de chargement avec animation */}
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Animated.View
                style={[
                  styles.loadingDot,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <AppText style={styles.loadingText}>
                Génération en cours...
              </AppText>
            </View>
          )}

          {/* 📝 Titre avec style amélioré */}
          <AppText 
            style={[styles.title, isLoading && styles.titleLoading]}
            bold
          >
            {title}
          </AppText>

          {/* 🎨 Contenu markdown */}
          {!isLoading && <Markdown style={markdownStyles}>{content}</Markdown>}

          {/* 🔗 Source interactive avec haptic feedback */}
          {!isLoading && (
            <Pressable
              onPressIn={handleSourcePressIn}
              onPressOut={handleSourcePressOut}
              onPress={handleSourcePress}
              disabled={sourceInfo.type === "text"}
              style={({ pressed }) => [
                dynamicStyles.sourceContainer,
                pressed &&
                  sourceInfo.type !== "text" &&
                  styles.sourcePressedState,
              ]}
            >
              <Animated.View
                style={[
                  styles.sourceContent,
                  { transform: [{ scale: sourceScale }] },
                ]}
              >
                <AppText style={dynamicStyles.sourceText}>
                  {sourceInfo.displayText}
                </AppText>

                {/* ✅ Indicateur animé pour les liens cliquables */}
                {sourceInfo.type !== "text" && (
                  <Animated.Text
                    style={[
                      styles.linkIndicator,
                      { transform: [{ scale: sourceScale }] },
                    ]}
                  >
                    {" ↗"}
                  </Animated.Text>
                )}
              </Animated.View>
            </Pressable>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

/**
 * 🚀 Export mémoïsé avec nouvelle prop index
 */
export default memo(Cards, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.content === nextProps.content &&
    prevProps.source === nextProps.source &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.index === nextProps.index
  );
});

/**
 * 🎨 Styles avec support haptic optimisé
 */
const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: "center",
    marginVertical: 8,
  },

  card: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",

    // ✅ Shadow subtile pour l'effet profondeur
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  loadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#81b0ff",
    marginRight: 8,
  },

  loadingText: {
    fontSize: 12,
    color: "#81b0ff",
    fontStyle: "italic",
  },

  title: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -0.3,
    lineHeight: 24,
    fontFamily: "Satoshi-Bold", // ✅ Utilisation de Satoshi pour le titre
  },

  titleLoading: {
    opacity: 0.7,
  },

  sourceContainer: {
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 8, // ✅ AUGMENTÉ : Meilleur touch target pour haptic
    borderRadius: 8,
    alignSelf: "flex-start",
    overflow: "hidden",
    minHeight: 36, // ✅ NOUVEAU : Touch target optimisé pour haptic
  },

  sourcePressedState: {
    backgroundColor: "rgba(129, 176, 255, 0.15)",
  },

  sourceContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  sourceText: {
    fontSize: 13,
    fontWeight: "500",
    fontStyle: "italic",
  },

  linkIndicator: {
    fontSize: 11,
    color: "#81b0ff",
    fontWeight: "bold",
  },
});

/**
 * 🎨 Styles Markdown inchangés
 */
const markdownStyles = StyleSheet.create({
  body: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Satoshi-Regular", // ✅ Utilisation de Satoshi pour le contenu
  },

  strong: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Satoshi-Bold",
  },

  bullet_list: {
    marginBottom: 10,
    marginLeft: 6,
    fontFamily: "Satoshi-Regular",
  },

  ordered_list: {
    marginBottom: 10,
    marginLeft: 6,
    fontFamily: "Satoshi-Regular",
  },

  list_item: {
    marginBottom: 5,
    fontFamily: "Satoshi-Regular",
  },

  heading1: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 16,
    color: "#FFFFFF",
    letterSpacing: -0.3,
    fontFamily: "Satoshi-Bold",
  },

  heading2: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
    color: "#FFFFFF",
    letterSpacing: -0.3,
    fontFamily: "Satoshi-Regular",
  },

  heading3: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#FFFFFF",
    letterSpacing: -0.3,
    fontFamily: "Satoshi-Bold",
  },

  paragraph: {
    marginBottom: 10,
    fontFamily: "Satoshi-Regular",
  },

  link: {
    color: "#81b0ff",
    textDecorationLine: "underline",
    fontFamily: "Satoshi-Bold",
  },

  code_inline: {
    backgroundColor: "rgba(129, 176, 255, 0.15)",
    color: "#81b0ff",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
    fontFamily:
      Platform.OS === "ios" ? "Satoshi-Bold" : "Satoshi-Regular", // ✅ Satoshi pour le code inline
  },

  fence: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#81b0ff",
    fontFamily: "Satoshi-Regular",
  },
});

/**
 * 📚 HAPTIC FEEDBACK COMPLET DANS CARDS
 *
 * ✅ INTERACTIONS HAPTIC IMPLÉMENTÉES :
 *
 * 🎯 MICRO-INTERACTIONS :
 * - Apparition de contenu : hapticMicro() après animation (3 premières cartes)
 * - Touch card : hapticSoft() immédiat sur press
 * - Exploration source : hapticMicro() pour zones secondaires
 *
 * 🔗 ACTIONS SUR SOURCES :
 * - Lien simple : hapticMedium() avant ouverture (action importante)
 * - Multi-sources : hapticSoft() pour menu + hapticMedium() pour sélection
 * - Erreur lien : hapticError() pour feedback négatif
 * - Annulation : hapticMicro() pour action discrète
 *
 * 👆 LONG PRESS CONTEXTUEL :
 * - Pattern progressif : hapticLongPress() (Micro → Soft → Medium)
 * - Menu contextuel avec feedback par option
 * - Hiérarchie haptic selon l'importance des actions
 *
 * 🎭 COORDINATION ANIMATIONS :
 * - Haptic sync avec animations visuelles
 * - Touch feedback immédiat + action confirmée
 * - Patterns différenciés selon type d'interaction
 * - Stagger haptic pour éviter le spam
 *
 * 📱 TOUCH TARGETS OPTIMISÉS :
 * - Sources : paddingVertical augmenté + minHeight 36px
 * - Touch targets accessibility-friendly
 * - Zones haptic clairement définies
 *
 * 🎯 EXPÉRIENCE RÉSULTANTE :
 * - Chaque card "vit" sous les doigts
 * - Feedback intelligent selon le contexte
 * - Exploration tactile satisfaisante
 * - Actions importantes bien confirmées
 *
 * 🚀 SYSTÈME HAPTIC COMPLET PRÊT :
 * ✅ Hook useHaptic() avec patterns avancés
 * ✅ EmptyState avec micro-interactions premium
 * ✅ HomeScreen avec navigation et actions
 * ✅ Cards avec exploration et long-press
 *
 * 🎊 TON APP A MAINTENANT UN HAPTIC FEEDBACK NIVEAU PREMIUM !
 */
