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

const { width } = Dimensions.get("window");

type Props = {
  title: string;
  content: string;
  source: string;
  isLoading?: boolean;
  index?: number; // ✅ NOUVEAU : Pour l'animation décalée
};

/**
 * 🎴 GlassCard avec animations d'apparition spectaculaires
 *
 * ✨ Nouvelles animations ajoutées :
 * - Slide + Fade in avec décalage par index
 * - Scale animation au tap
 * - Entrance animation en 3 phases
 * - Spring physics pour un rendu naturel
 * - Stagger effect pour plusieurs cartes
 */
function GlassCard({
  title,
  content,
  source,
  isLoading = false,
  index = 0,
}: Props) {
  // ✅ États pour les animations d'apparition
  const [cardScale] = useState(new Animated.Value(1));
  const [sourceScale] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  // ✅ NOUVEAU : Animations d'entrée sophistiquées
  const [slideY] = useState(new Animated.Value(50)); // Démarre 50px plus bas
  const [opacity] = useState(new Animated.Value(0)); // Démarre invisible
  const [scaleEntry] = useState(new Animated.Value(0.9)); // Démarre légèrement réduit

  // ✅ NOUVEAU : Animation d'entrée en 3 phases
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
  }, [index]);

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
   * 🎭 Animations de feedback tactile améliorées
   */
  const handleCardPressIn = useCallback(() => {
    Animated.spring(cardScale, {
      toValue: 1.003, // ✅ Légèrement plus subtil
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  }, [cardScale]);

  const handleCardPressOut = useCallback(() => {
    // ✅ VERSION ULTRA LÉGÈRE - bounce presque imperceptible
    Animated.sequence([
      Animated.spring(cardScale, {
        toValue: 1.003, // ✅ TRÈS PETIT bounce (au lieu de 1.02)
        useNativeDriver: true,
        tension: 200,   // ✅ TRÈS ÉLEVÉ = mouvement rapide et ferme
        friction: 10,   // ✅ TRÈS ÉLEVÉ = arrêt immédiat, pas d'oscillations
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 1000,  // ✅ ULTRA ÉLEVÉ = retour instantané
        friction: 30,   // ✅ ULTRA ÉLEVÉ = aucune oscillation
      }),
    ]).start();
  }, [cardScale]);

  const handleSourcePressIn = useCallback(() => {
    if (sourceInfo.type !== "text") {
      Animated.spring(sourceScale, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }).start();
    }
  }, [sourceScale, sourceInfo.type]);

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
   * 🎯 Gestion des clics sur les sources avec animation
   */
  const handleSourcePress = useCallback(async () => {
    if (sourceInfo.type === "single_url" && sourceInfo.url) {
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
    } else if (sourceInfo.type === "multiple_urls" && sourceInfo.urls) {
      const urlOptions = sourceInfo.urls.map((url, index) => ({
        text: extractDomainName(url),
        onPress: () => Linking.openURL(url),
      }));

      Alert.alert("Choisir une source", "Plusieurs sources disponibles :", [
        ...urlOptions.map((option, index) => ({
          text: option.text,
          onPress: option.onPress,
        })),
        { text: "Annuler", style: "cancel" },
      ]);
    }
  }, [sourceInfo, extractDomainName]);

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
      {/* ✅ Card animée avec toutes les animations d'entrée */}
      <Pressable
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity, // ✅ Fade in
              transform: [
                { translateY: slideY }, // ✅ Slide in from bottom
                { scale: Animated.multiply(cardScale, scaleEntry) }, // ✅ Scale combiné (tap + entrée)
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

          {/* 🔗 Source interactive avec animations */}
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
export default memo(GlassCard, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.content === nextProps.content &&
    prevProps.source === nextProps.source &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.index === nextProps.index
  );
});

/**
 * 🎨 Styles avec nouvelles animations d'entrée
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

    // ✅ NOUVEAU : Shadow subtile pour l'effet "levitation"
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
  },

  titleLoading: {
    opacity: 0.7,
  },

  sourceContainer: {
    marginTop: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    overflow: "hidden",
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
    fontWeight: "400",
  },

  strong: {
    fontWeight: "700",
    color: "#FFFFFF",
  },

  bullet_list: {
    marginBottom: 10,
    marginLeft: 6,
  },

  ordered_list: {
    marginBottom: 10,
    marginLeft: 6,
  },

  list_item: {
    marginBottom: 5,
  },

  heading1: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 16,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  heading2: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 14,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  heading3: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  paragraph: {
    marginBottom: 10,
  },

  link: {
    color: "#81b0ff",
    textDecorationLine: "underline",
  },

  code_inline: {
    backgroundColor: "rgba(129, 176, 255, 0.15)",
    color: "#81b0ff",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },

  fence: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#81b0ff",
  },
});

/**
 * 📚 NOUVELLES ANIMATIONS D'APPARITION IMPLÉMENTÉES
 *
 * ✨ ENTRÉE EN 3 PHASES :
 * 1. Opacity + Scale (600ms avec spring physics)
 * 2. Slide Y (slide depuis le bas avec spring)
 * 3. Stagger effect (150ms de décalage entre cartes)
 *
 * ✨ MICRO-INTERACTIONS AMÉLIORÉES :
 * - Tap scale plus subtil (0.97 au lieu de 0.98)
 * - Bounce effect en sortie de tap
 * - Shadow pour effet "levitation"
 * - Physics spring pour rendu naturel
 *
 * ✨ GESTION DE L'INDEX :
 * - Prop `index` pour stagger automatique
 * - Plus l'index est élevé, plus l'animation est retardée
 * - Effet cascade naturel sur le feed
 *
 * 🎯 RÉSULTAT :
 * - Apparition fluide et spectaculaire
 * - Feed qui "se construit" progressivement
 * - Micro-interactions plus satisfaisantes
 * - Rendu professionnel de niveau production
 */
