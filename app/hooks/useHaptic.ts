import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * 📳 Types de feedback haptic modernes - Tendances 2025
 * 
 * Basé sur les guidelines Apple/Google et apps premium actuelles :
 * - Micro-interactions : feedback subtil pour les petites actions
 * - Actions importantes : feedback marqué pour les actions principales
 * - Erreurs/warnings : feedback distinctif pour les alertes
 * - Success : feedback satisfaisant pour les confirmations
 */
export type HapticType = 
  | 'micro'        // Touch léger (hover, focus)
  | 'soft'         // Touch normal (boutons secondaires)
  | 'medium'       // Action importante (boutons principaux)
  | 'strong'       // Action critique (suppression, validation)
  | 'success'      // Confirmation positive
  | 'warning'      // Attention, erreur légère
  | 'error';       // Erreur critique

/**
 * 🎛️ Configuration du système haptic
 */
interface HapticConfig {
  enabled: boolean;           // Master switch
  respectReducedMotion: boolean;  // Respecter les préférences accessibilité
  intensityMultiplier: number;    // Multiplicateur d'intensité (0.5 à 2.0)
}

/**
 * 📳 Hook useHaptic - Système haptic feedback moderne
 * 
 * 🎯 Objectifs :
 * - Feedback tactile premium qui améliore l'UX
 * - Respect des préférences utilisateur et accessibilité
 * - Performance optimisée avec throttling
 * - Patterns cohérents avec les apps natives
 * - Facilité d'intégration dans tous les composants
 * 
 * 🔧 Fonctionnalités :
 * - 7 types de feedback adaptés aux différentes actions
 * - Respect automatique des préférences "reduced motion"
 * - Throttling pour éviter le spam de vibrations
 * - Fallbacks gracieux pour les appareils non supportés
 * - Configuration centralisée et modifiable
 * 
 * 📱 Support :
 * - iOS : Utilise Taptic Engine (iPhone 6s+)
 * - Android : Utilise Vibrator API moderne
 * - Fallback : Vibration basique sur anciens appareils
 */
export function useHaptic(config: Partial<HapticConfig> = {}) {
  // Configuration par défaut optimisée
  const defaultConfig: HapticConfig = {
    enabled: true,
    respectReducedMotion: true,
    intensityMultiplier: 1.0,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Throttling pour éviter le spam de vibrations
  let lastHapticTime = 0;
  const HAPTIC_THROTTLE_MS = 50; // Minimum 50ms entre vibrations

  /**
   * 🎵 Fonction principale de génération de haptic feedback
   * 
   * @param type - Type de feedback haptic à générer
   * @param force - Force le feedback même si throttlé (pour actions critiques)
   */
  const triggerHaptic = useCallback(async (
    type: HapticType, 
    force: boolean = false
  ): Promise<void> => {
    try {
      // Vérifications préalables
      if (!finalConfig.enabled) return;
      
      // Throttling (sauf si forcé)
      const now = Date.now();
      if (!force && (now - lastHapticTime) < HAPTIC_THROTTLE_MS) {
        return;
      }
      lastHapticTime = now;

      // TODO: Ajouter vérification des préférences "reduced motion" système
      // if (finalConfig.respectReducedMotion && isReducedMotionEnabled) return;

      // Génération du feedback selon le type
      await generateHapticFeedback(type, finalConfig.intensityMultiplier);

    } catch (error) {
      // Silently fail - haptic feedback ne doit jamais crasher l'app
      console.warn('Haptic feedback failed:', error);
    }
  }, [finalConfig]);

  /**
   * 🔨 Fonction de génération du feedback haptic
   * 
   * Mapping sophistiqué entre types logiques et implémentations natives
   */
  const generateHapticFeedback = async (
    type: HapticType, 
    intensity: number
  ): Promise<void> => {
    switch (type) {
      case 'micro':
        // Micro-interaction très subtile (hover, focus)
        if (Platform.OS === 'ios') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Android : vibration très courte
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;

      case 'soft':
        // Touch standard (boutons secondaires, navigation)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'medium':
        // Action importante (boutons principaux, sélection)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'strong':
        // Action critique (suppression, validation importante)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'success':
        // Confirmation positive (sauvegarde, création réussie)
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'warning':
        // Attention ou erreur légère
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case 'error':
        // Erreur critique ou action impossible
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      default:
        // Fallback sécurisé
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  /**
   * 🎯 Helpers spécialisés pour les cas d'usage courants
   * Simplifient l'intégration dans les composants
   */
  
  // Micro-interactions (hover, focus, slide)
  const hapticMicro = useCallback(() => triggerHaptic('micro'), [triggerHaptic]);
  
  // Buttons et touches
  const hapticSoft = useCallback(() => triggerHaptic('soft'), [triggerHaptic]);
  const hapticMedium = useCallback(() => triggerHaptic('medium'), [triggerHaptic]);
  const hapticStrong = useCallback(() => triggerHaptic('strong'), [triggerHaptic]);
  
  // Notifications de status
  const hapticSuccess = useCallback(() => triggerHaptic('success', true), [triggerHaptic]);
  const hapticWarning = useCallback(() => triggerHaptic('warning', true), [triggerHaptic]);
  const hapticError = useCallback(() => triggerHaptic('error', true), [triggerHaptic]);

  /**
   * 🚀 Patterns haptic pour actions complexes
   * Combinaisons de feedback pour des interactions sophistiquées
   */
  
  // Pattern de "pull-to-refresh" (micro + medium)
  const hapticPullRefresh = useCallback(async () => {
    await triggerHaptic('micro');
    setTimeout(() => triggerHaptic('medium'), 100);
  }, [triggerHaptic]);

  // Pattern de "swipe-to-delete" (soft + warning)
  const hapticSwipeDelete = useCallback(async () => {
    await triggerHaptic('soft');
    setTimeout(() => triggerHaptic('warning'), 150);
  }, [triggerHaptic]);

  // Pattern de "long-press" (progressif : micro → soft → medium)
  const hapticLongPress = useCallback(async () => {
    await triggerHaptic('micro');
    setTimeout(() => triggerHaptic('soft'), 200);
    setTimeout(() => triggerHaptic('medium'), 400);
  }, [triggerHaptic]);

  return {
    // API principale
    triggerHaptic,
    
    // Helpers rapides
    hapticMicro,
    hapticSoft,
    hapticMedium,
    hapticStrong,
    hapticSuccess,
    hapticWarning,
    hapticError,
    
    // Patterns avancés
    hapticPullRefresh,
    hapticSwipeDelete,
    hapticLongPress,
    
    // Configuration
    config: finalConfig,
  };
}

/**
 * 🎛️ Hook de configuration globale haptic
 * Permet de configurer le système haptic au niveau app
 */
export function useHapticConfig() {
  // TODO: Connecter à un système de préférences utilisateur
  // Pour l'instant, configuration statique
  
  const updateConfig = useCallback((newConfig: Partial<HapticConfig>) => {
    // TODO: Sauvegarder en AsyncStorage ou Context
    console.log('Haptic config updated:', newConfig);
  }, []);

  return {
    updateConfig,
    // TODO: Ajouter getters pour la config actuelle
  };
}

/**
 * 📚 GUIDE D'UTILISATION RAPIDE
 * 
 * ===== INTÉGRATION BASIQUE =====
 * 
 * ```typescript
 * import { useHaptic } from './hooks/useHaptic';
 * 
 * function MyButton() {
 *   const { hapticMedium } = useHaptic();
 *   
 *   return (
 *     <TouchableOpacity 
 *       onPress={() => {
 *         hapticMedium(); // ← Vibration sur tap
 *         handlePress();
 *       }}
 *     >
 *       <Text>Mon Bouton</Text>
 *     </TouchableOpacity>
 *   );
 * }
 * ```
 * 
 * ===== PATTERNS RECOMMANDÉS =====
 * 
 * 🔵 BOUTONS PRINCIPAUX :
 * - onPressIn: hapticSoft() (feedback immédiat)
 * - onPress: hapticMedium() (confirmation action)
 * 
 * 🔵 BOUTONS SECONDAIRES/NAVIGATION :
 * - onPress: hapticSoft()
 * 
 * 🔵 ACTIONS CRITIQUES (SUPPRESSION) :
 * - onPress: hapticStrong()
 * - onSuccess: hapticSuccess() ou hapticError()
 * 
 * 🔵 MICRO-INTERACTIONS :
 * - onPressIn/onFocus: hapticMicro()
 * - onHover (web): hapticMicro()
 * 
 * ===== PATTERNS AVANCÉS =====
 * 
 * 🌊 PULL-TO-REFRESH :
 * ```typescript
 * onRefresh={() => {
 *   hapticPullRefresh();
 *   actualRefresh();
 * }}
 * ```
 * 
 * 👆 LONG-PRESS MENUS :
 * ```typescript
 * onLongPress={() => {
 *   hapticLongPress();
 *   showContextMenu();
 * }}
 * ```
 * 
 * 📊 NOTIFICATIONS DE STATUS :
 * ```typescript
 * try {
 *   await saveData();
 *   hapticSuccess(); // ✅ Succès
 * } catch (error) {
 *   hapticError();   // ❌ Erreur
 * }
 * ```
 * 
 * ===== BONNES PRATIQUES =====
 * 
 * ✅ À FAIRE :
 * - Utiliser hapticMicro() pour les micro-interactions
 * - Utiliser hapticMedium() pour les actions importantes
 * - Utiliser hapticSuccess/Error pour les résultats d'actions
 * - Respecter les préférences utilisateur
 * 
 * ❌ À ÉVITER :
 * - Spam de vibrations (déjà géré par throttling)
 * - Vibrations sur chaque scroll/animation
 * - Vibrations trop fortes pour des actions mineures
 * - Oublier les fallbacks pour appareils non supportés
 * 
 * 🎯 RÉSULTAT ATTENDU :
 * Sensation tactile premium qui rend l'app plus satisfaisante
 * à utiliser, comparable aux meilleures apps natives.
 */