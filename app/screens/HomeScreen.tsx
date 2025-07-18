import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import GlassCard from "../components/GlassCard";
import { usePrompt, Prompt } from "../context/PromptContext"; // ✅ Import du type Prompt
import { Trash, Plus, List } from "phosphor-react-native";
import AddScheduledPromptScreen from "./AddScheduledPromptScreen";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Modal } from "react-native";

/**
 * 🏠 Écran principal de l'application Prism - Version harmonisée
 *
 * 🎨 Styles harmonisés avec ManagePromptsScreen :
 * - Header cohérent avec même structure et espacements
 * - Barre de recherche alignée sur le design global
 * - Boutons avec hauteurs fixes et styles uniformes
 * - Espacements et marges cohérents
 * - Effets visuels harmonisés
 *
 * 🔧 Optimisations conservées :
 * - useCallback pour éviter les re-créations de fonctions
 * - Mémoïsation des éléments de liste coûteux
 * - Fermeture automatique du clavier lors du scroll
 * - Optimisation des props du FlatList
 *
 * Fonctionnalités principales :
 * - Feed des prompts avec sources web extraites
 * - Recherche instantanée avec validation
 * - Planification de prompts récurrents
 * - Rafraîchissement manuel (pull-to-refresh)
 * - Vérification automatique des prompts planifiés
 */
export default function HomeScreen() {
  // Navigation et contexte - pas de changement nécessaire
  const navigation = useNavigation();
  const { prompts, checkAndRunScheduledPrompts, addPrompt } = usePrompt();

  // États locaux optimisés
  const [refreshing, setRefreshing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState("");

  /**
   * 🔄 Vérification automatique des prompts planifiés
   * Optimisation : useCallback pour éviter les re-créations
   */
  const checkScheduledPrompts = useCallback(() => {
    checkAndRunScheduledPrompts();
  }, [checkAndRunScheduledPrompts]);

  useEffect(() => {
    // Vérification immédiate au montage
    checkScheduledPrompts();

    // Puis toutes les minutes
    const interval = setInterval(checkScheduledPrompts, 60000);
    return () => clearInterval(interval);
  }, [checkScheduledPrompts]);

  /**
   * 🔽 Gestion optimisée du rafraîchissement
   * useCallback évite les re-créations inutiles
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkAndRunScheduledPrompts();
    setRefreshing(false);
  }, [checkAndRunScheduledPrompts]);

  /**
   * 🚀 Soumission optimisée des prompts instantanés
   */
  const handleSearchSubmit = useCallback(async () => {
    const trimmedPrompt = searchPrompt.trim();
    if (trimmedPrompt) {
      await addPrompt(trimmedPrompt);
      setSearchPrompt("");
      // Fermeture automatique du clavier après soumission
      Keyboard.dismiss();
    }
  }, [searchPrompt, addPrompt]);

  /**
   * 🎯 Gestion optimisée des modales
   */
  const openScheduleModal = useCallback(() => setShowScheduleModal(true), []);
  const closeScheduleModal = useCallback(() => setShowScheduleModal(false), []);

  /**
   * 📝 Optimisation critique : Mémoïsation du feed
   * Recalcul uniquement si le tableau prompts change
   */
  const feedPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        // ✅ NOUVEAU : Filtrage plus strict pour exclure les états de chargement
        return (
          p.response &&
          p.response !== "" &&
          p.response !== "⏳ Génération en cours..." &&
          p.response !== "⏳ Exécution en cours..." &&
          !p.response.startsWith("⏳")
        ); // Sécurité pour tous les états de chargement
      })
      .slice() // Copie pour éviter la mutation
      .sort((a, b) => {
        // ✅ NOUVEAU : Tri explicite par date décroissante (plus récents en haut)
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA; // Ordre décroissant : plus récent → plus ancien
      });
  }, [prompts]);

  /**
   * 🎭 Fonction de rendu optimisée pour FlatList avec typage correct
   * useCallback évite les re-renders des items
   */
  const renderPromptItem = useCallback(
    ({ item, index }: { item: Prompt; index: number }) => (
      <GlassCard
        title={item.question}
        content={item.response}
        source={item.source}
        index={index} // ✅ NOUVEAU : Passer l'index pour l'animation staggered
      />
    ),
    []
  );

  /**
   * 🔑 Optimisation critique : keyExtractor mémoïsé avec typage
   * Évite les re-calculs d'ID à chaque render
   */
  const keyExtractor = useCallback((item: Prompt) => item.id, []);

  /**
   * 📱 Composant RefreshControl mémoïsé
   * Évite les re-créations à chaque render
   */
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={["#fff"]}
        tintColor="#fff"
      />
    ),
    [refreshing, handleRefresh]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 🎯 Header optimisé avec fermeture clavier */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.headerRow}>
          {/* Bouton drawer - optimisé avec useCallback */}
          <TouchableOpacity
            accessibilityLabel="Ouvrir le menu de navigation"
            accessibilityRole="button"
            onPress={useCallback(
              () => navigation.dispatch(DrawerActions.openDrawer()),
              [navigation]
            )}
          >
            <List size={26} weight="bold" color="white" />
          </TouchableOpacity>

          {/* Barre de recherche harmonisée avec le style des cartes */}
          <View style={styles.searchHeaderBar}>
            <TextInput
              value={searchPrompt}
              onChangeText={setSearchPrompt}
              placeholder="Tape ton prompt ici..."
              placeholderTextColor="#888"
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="send"
              style={styles.searchInput}
              accessibilityLabel="Champ de saisie pour nouveau prompt"
              // Optimisation : réduction des re-renders
              blurOnSubmit={false}
              // Amélioration UX : correction automatique
              autoCorrect
              // Performance : pas de spell check constant
              spellCheck={false}
            />
          </View>

          {/* Bouton planification optimisé */}
          <TouchableOpacity
            accessibilityLabel="Planifier un nouveau prompt"
            accessibilityRole="button"
            onPress={openScheduleModal}
          >
            <Plus size={26} weight="bold" color="white" />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      {/* 📜 FlatList hautement optimisée */}
      <FlatList
        data={feedPrompts}
        keyExtractor={keyExtractor}
        renderItem={renderPromptItem}
        refreshControl={refreshControl}
        // 🚀 Optimisations de performance critiques
        removeClippedSubviews={true} // Économise la mémoire
        maxToRenderPerBatch={5} // Limite le rendu par batch
        windowSize={10} // Optimise la fenêtre de rendu
        initialNumToRender={3} // Rendu initial limité
        updateCellsBatchingPeriod={50} // Groupage des mises à jour
        // 🎨 Améliorations visuelles
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          feedPrompts.length === 0 ? styles.emptyContainer : undefined
        }
        // 📱 Amélioration de l'expérience utilisateur
        keyboardShouldPersistTaps="handled" // Permet l'interaction même avec clavier ouvert
        onScrollBeginDrag={Keyboard.dismiss} // Ferme le clavier au scroll

        // 🔄 Performance : getItemLayout pour éléments de taille fixe
        // Décommentez si vos cards ont une taille fixe connue
        // getItemLayout={(data, index) => (
        //   {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
        // )}
      />

      {/* 📅 Modal optimisée de planification */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeScheduleModal}
        // Optimisation : pas de re-render si pas visible
        statusBarTranslucent={false}
      >
        <AddScheduledPromptScreen />
      </Modal>
    </SafeAreaView>
  );
}

/**
 * 🎨 Styles optimisés et consolidés avec searchbar harmonisée
 * Réduction des calculs de style répétitifs
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1E1E1E",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
    // Optimisation : hauteur fixe pour éviter les recalculs
    minHeight: 44,
  },

  searchHeaderBar: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: "#252525",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 6 : 4,

    // ✅ SUPPRESSION des ombres pour correspondre aux GlassCards
    // Plus d'effets d'élévation pour cohérence totale

    // ✅ BORDURES identiques aux GlassCards
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  searchInput: {
    fontSize: 16,
    color: "#ffffff",
    // Optimisation : hauteur fixe
    minHeight: Platform.OS === "ios" ? 20 : 24,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ✅ Texte vide harmonisé
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 8,
  },

  emptySubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

/**
 * 📚 HARMONISATION COMPLÈTE DE LA SEARCHBAR
 *
 * 🎨 COHÉRENCE VISUELLE TOTALE :
 * ✅ Suppression de toutes les ombres (shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation)
 * ✅ Ajout des bordures identiques aux GlassCards : borderWidth: 1 + borderColor: "rgba(255, 255, 255, 0.06)"
 * ✅ Même backgroundColor: "#252525" (conservé)
 * ✅ Même borderRadius: 12 (conservé)
 * ✅ Même padding horizontal/vertical (conservé)
 *
 * 🔧 RÉSULTAT :
 * - La searchbar a maintenant exactement le même rendu que les GlassCards
 * - Rendu plat sans ombres
 * - Bordure subtile blanche identique
 * - Cohérence visuelle parfaite dans toute l'application
 *
 * 📊 IMPACT :
 * - Design system unifié
 * - Expérience utilisateur cohérente
 * - Pas de différences visuelles entre les éléments
 * - Style moderne et épuré
 */
