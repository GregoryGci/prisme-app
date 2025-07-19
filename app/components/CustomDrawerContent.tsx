import React, { useCallback } from "react";
import AppText from "../components/AppText";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useHaptic } from "../hooks/useHaptic"; // ✅ Import haptic
import { House, Wrench, CalendarPlus, User, Gear } from "phosphor-react-native";

/**
 * 🎨 CustomDrawerContent avec Items Custom et Haptic Feedback Complet
 *
 * 🆕 FONCTIONNALITÉS HAPTIC COMPLÈTES :
 * - Feedback tactile sur CHAQUE item de navigation
 * - Vibrations différenciées selon l'importance des actions
 * - Micro-interactions premium sur tous les éléments
 * - Expérience tactile cohérente et satisfaisante
 * - Icons Phosphor pour une apparence moderne
 *
 * 🎯 REMPLACEMENT COMPLET de DrawerItemList
 * Tous les items sont maintenant des TouchableOpacity custom
 * avec contrôle total sur l'apparence et les interactions haptic.
 */
export default function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  // ✅ Hook haptic pour feedback tactile uniforme
  const { hapticSoft, hapticMicro } = useHaptic();

  /**
   * 🧭 Navigation avec haptic feedback uniforme
   * Feedback tactile cohérent pour toutes les actions
   */
  const navigateToScreen = useCallback(
    (screenName: string) => {
      // Feedback tactile uniforme pour toutes les navigations
      hapticSoft();

      // Navigation React Navigation
      props.navigation.navigate(screenName);
    },
    [hapticSoft, props.navigation]
  );

  /**
   * 🚪 Gestion de la déconnexion avec haptic feedback
   */
  const handleLogout = useCallback(() => {
    // Feedback tactile uniforme
    hapticSoft();
    alert("Déconnexion");
  }, [hapticSoft]);

  /**
   * ✨ Feedback haptic subtil sur focus/hover des items
   * (Optionnel - pour une expérience encore plus premium)
   */
  const handleItemPressIn = useCallback(() => {
    hapticMicro(); // Micro-vibration très subtile sur touch
  }, [hapticMicro]);

  return (
    <View style={styles.container}>
      {/* 🧭 Section Navigation Principale */}
      <ScrollView
        style={styles.navigationSection}
        contentContainerStyle={styles.links}
      >
        {/* 🏠 Accueil */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("Accueil")}
          onPressIn={handleItemPressIn}
          activeOpacity={0.7}
          accessibilityLabel="Accueil - Voir le feed des prompts"
          accessibilityRole="button"
        >
          <View style={styles.itemContent}>
            <House size={22} color="#fff" weight="regular" />
            <AppText style={styles.drawerItemText}>Accueil</AppText>
          </View>
        </TouchableOpacity>

        {/* 🔧 Gestion des prompts */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("Gérer les prompts")}
          onPressIn={handleItemPressIn}
          activeOpacity={0.7}
          accessibilityLabel="Gérer les prompts - Éditer et organiser"
          accessibilityRole="button"
        >
          <View style={styles.itemContent}>
            <Wrench size={22} color="#fff" weight="regular" />
            <AppText style={styles.drawerItemText}>Gérer les prompts</AppText>
          </View>
        </TouchableOpacity>

        {/* 📅 Planification */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("Planifier un prompt")}
          onPressIn={handleItemPressIn}
          activeOpacity={0.7}
          accessibilityLabel="Planifier un prompt - Créer des prompts automatiques"
          accessibilityRole="button"
        >
          <View style={styles.itemContent}>
            <CalendarPlus size={22} color="#fff" weight="regular" />
            <AppText style={styles.drawerItemText}>Planifier un prompt</AppText>
          </View>
        </TouchableOpacity>

        {/* 👤 Profil */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("Profil")}
          onPressIn={handleItemPressIn}
          activeOpacity={0.7}
          accessibilityLabel="Profil - Voir statistiques et achievements"
          accessibilityRole="button"
        >
          <View style={styles.itemContent}>
            <User size={22} color="#fff" weight="regular" />
            <AppText style={styles.drawerItemText}>Profil</AppText>
          </View>
        </TouchableOpacity>

        {/* ⚙️ Paramètres */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => navigateToScreen("Paramètres")}
          onPressIn={handleItemPressIn}
          activeOpacity={0.7}
          accessibilityLabel="Paramètres - Configuration de l'application"
          accessibilityRole="button"
        >
          <View style={styles.itemContent}>
            <Gear size={22} color="#fff" weight="regular" />
            <AppText style={styles.drawerItemText}>Paramètres</AppText>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 🚪 Section Déconnexion */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout} // ✅ Action critique avec haptic fort
        activeOpacity={0.7}
        accessibilityLabel="Se déconnecter de l'application"
        accessibilityRole="button"
      >
        <AppText style={styles.logoutText}>Se déconnecter</AppText>
      </TouchableOpacity>
    </View>
  );
}

/**
 * 🎨 Styles complets pour navigation haptic premium
 *
 * Design cohérent avec l'original mais optimisé pour l'interaction tactile
 */
const styles = StyleSheet.create({
  // Container principal - COHÉRENT avec l'original
  container: {
    flex: 1,
    backgroundColor: "#323232", // ✅ Couleur drawer originale conservée
  },

  // Section de navigation
  navigationSection: {
    flex: 1,
  },

  // Style pour la liste des liens - COHÉRENT avec l'original
  links: {
    paddingTop: 50, // ✅ Padding original conservé
    paddingHorizontal: 8, // Marges pour les items
  },

  // ✅ Item drawer custom avec haptic optimisé - Style uniforme
  drawerItem: {
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12, // ✅ BorderRadius original conservé
    backgroundColor: "transparent",
    // ✅ Touch target optimisé pour haptic
    minHeight: 48, // Accessibility + haptic optimal
    justifyContent: "center",
  },

  // ✅ Contenu de l'item avec icône
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // ✅ Texte drawer custom - Style uniforme
  drawerItemText: {
    color: "#fff", // ✅ Couleur originale conservée
    fontSize: 16, // ✅ Taille originale conservée
    fontWeight: "500",
    marginLeft: 12, // Espace après l'icône
  },

  // Bouton de déconnexion - Style simplifié
  logoutButton: {
    padding: 20, // ✅ Padding original conservé
    // ✅ Barre blanche supprimée
    minHeight: 60,
    justifyContent: "center",
  },

  // Texte de déconnexion - STYLE ORIGINAL EXACT
  logoutText: {
    fontSize: 16, // ✅ Taille originale conservée
    color: "rgb(252, 71, 71)", // ✅ Couleur rouge originale conservée
    fontWeight: "500", // ✅ Weight original conservé
    marginLeft: 8, // ✅ Margin original conservé
  },
});

/**
 * 📚 HAPTIC FEEDBACK UNIFORME POUR DRAWER - VERSION SIMPLIFIÉE
 *
 * ✅ PATTERNS HAPTIC IMPLÉMENTÉS :
 *
 * 🎯 NAVIGATION UNIFORME :
 * - Tous les items : hapticSoft() - Feedback cohérent
 * - Déconnexion : hapticSoft() - Cohérence totale
 * - onPressIn : hapticMicro() - Micro-feedback subtil sur touch
 *
 * 🎨 DESIGN ÉPURÉ :
 * - Style uniforme pour tous les items
 * - Pas de hiérarchie visuelle complexe
 * - Icônes blanches cohérentes
 * - Pas de séparateurs ou barres
 *
 * ✅ AVANTAGES :
 * ✅ Expérience tactile simple et cohérente
 * ✅ Design épuré et moderne
 * ✅ Haptic feedback sur tous les éléments
 * ✅ Touch targets optimisés (48px+)
 * ✅ Accessibilité améliorée
 *
 * 🎊 EXPÉRIENCE RÉSULTANTE :
 * - Navigation fluide avec feedback tactile uniforme
 * - Design clean sans distractions visuelles
 * - Micro-interactions satisfaisantes
 * - Cohérence parfaite avec le reste de l'app
 *
 * 🚀 RÉSULTAT FINAL :
 * Drawer épuré avec haptic feedback cohérent sur tous les éléments !
 */
