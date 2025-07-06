import React, { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  RefreshControl,
} from "react-native";
import GlassCard from "../components/GlassCard";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";
import { Trash, Plus, List } from "phosphor-react-native";
import AddScheduledPromptScreen from "./AddScheduledPromptScreen";
import { useNavigation, DrawerActions } from "@react-navigation/native";

/**
 * 🏠 Écran principal de l'application Prism
 *
 * Fonctionnalités principales :
 * - Affichage du feed des prompts exécutés (réponses reçues)
 * - Barre de recherche pour soumettre des prompts instantanés
 * - Accès au drawer de navigation
 * - Modal pour planifier des prompts récurrents
 * - Rafraîchissement manuel du feed (pull-to-refresh)
 * - Vérification automatique des prompts planifiés toutes les minutes
 */
export default function HomeScreen() {
  // Navigation pour contrôler le drawer et les transitions
  const navigation = useNavigation();

  // Contexte global pour la gestion des prompts
  const { prompts, checkAndRunScheduledPrompts, clearPrompts, addPrompt } =
    usePrompt();

  // États locaux du composant
  const [refreshing, setRefreshing] = useState(false); // Indicateur de rafraîchissement
  const [showScheduleModal, setShowScheduleModal] = useState(false); // Contrôle de la modal de planification
  const [searchPrompt, setSearchPrompt] = useState(""); // Texte de la barre de recherche

  /**
   * 🔄 Vérification automatique des prompts planifiés
   * Lance une vérification toutes les 60 secondes pour exécuter
   * les prompts qui ont atteint leur heure programmée
   */
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndRunScheduledPrompts();
    }, 60000); // Intervalle de 60 secondes

    // Nettoyage de l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, [checkAndRunScheduledPrompts]);

  /**
   * 🔽 Gestion du rafraîchissement manuel (pull-to-refresh)
   * Permet à l'utilisateur de forcer la vérification des prompts planifiés
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await checkAndRunScheduledPrompts();
    setRefreshing(false);
  };

  /**
   * 📝 Filtrage et optimisation des prompts pour le feed
   */
  const feedPrompts = useMemo(() => {
    // Filtrer les prompts qui ont une réponse (prompts exécutés)
    const promptsWithResponse = prompts.filter((p) => p.response);
    // Inverser l'ordre pour afficher les plus récents en premier
    return promptsWithResponse.slice().reverse();
  }, [prompts]); // Dépendance : recalcul uniquement si prompts change

  /**
   * 🚀 Soumission d'un prompt instantané depuis la barre de recherche
   * Crée et exécute immédiatement un prompt (non planifié)
   */
  const handleSearchSubmit = async () => {
    if (searchPrompt.trim()) {
      await addPrompt(searchPrompt); // Exécution immédiate via le contexte
      setSearchPrompt(""); // Réinitialisation du champ de saisie
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🎯 Header avec navigation, recherche et actions */}
      <View style={styles.headerRow}>
        {/* Bouton d'ouverture du drawer de navigation */}
        <TouchableOpacity
          accessibilityLabel="Ouvrir le menu de navigation"
          accessibilityRole="button"
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <List size={26} weight="bold" color="white" />
        </TouchableOpacity>

        {/* Barre de recherche centrée et responsive */}
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
          />
        </View>

        {/* Bouton d'accès à la planification de prompts */}
        <TouchableOpacity
          accessibilityLabel="Planifier un nouveau prompt"
          accessibilityRole="button"
          onPress={() => setShowScheduleModal(true)}
        >
          <Plus size={26} weight="bold" color="white" />
        </TouchableOpacity>
      </View>

      {/* 📜 Feed principal des prompts exécutés */}
      <FlatList
        data={feedPrompts} // ✅ Utilisation de la version optimisée
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GlassCard
            title={item.question}
            content={item.response}
            source={item.source}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#fff"]} // Couleur de l'indicateur sur Android
            tintColor="#fff" // Couleur de l'indicateur sur iOS
          />
        }
        showsVerticalScrollIndicator={false} // Interface plus propre
        contentContainerStyle={
          feedPrompts.length === 0 && styles.emptyContainer
        }
      />

      {/* 📅 Modal de planification des prompts récurrents */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <AddScheduledPromptScreen />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal avec fond sombre cohérent
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#1E1E1E",
  },

  // Ligne d'en-tête avec disposition horizontale équilibrée
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },

  // Conteneur de la barre de recherche avec effet glassmorphism
  searchHeaderBar: {
    flex: 1, // Prend tout l'espace disponible entre les boutons
    marginHorizontal: 12,
    backgroundColor: "#252525",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 6 : 4,

    // Effets visuels modernes
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Ombre sur Android
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)", // Bordure subtile
  },

  // Style du champ de saisie intégré
  searchInput: {
    fontSize: 16,
    color: "#ffffff",
    // Pas de styles supplémentaires pour garder l'apparence native
  },

  // Style pour le conteneur vide (quand aucun prompt n'est affiché)
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
