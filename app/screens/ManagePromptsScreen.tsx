import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  ScrollView,
} from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import {
  List,
  Pencil,
  Trash,
  Clock,
  Plus,
  FunnelSimple,
  MagnifyingGlass,
  Tag,
  Newspaper,
  Desktop,
  Flask,
  Briefcase,
  User,
  Files,
} from "phosphor-react-native";
import { usePrompt, Prompt } from "../context/PromptContext";
import AppText from "../components/AppText";
import DateTimePicker from "@react-native-community/datetimepicker";

/**
 * 🔧 Écran de gestion avancée des prompts planifiés
 *
 * Fonctionnalités :
 * - Liste de tous les prompts (planifiés et exécutés)
 * - Édition en place des prompts planifiés
 * - Suppression individuelle avec confirmation
 * - Filtrage par catégorie et statut
 * - Recherche par nom/contenu
 * - Système de catégories avec tags colorés
 */

// Catégories prédéfinies avec couleurs (sans émojis - utilisation d'icônes Phosphor)
const CATEGORIES = [
  { id: "news", name: "Actualités", color: "#ff6b6b", icon: "Newspaper" },
  { id: "tech", name: "Technologie", color: "#4ecdc4", icon: "Desktop" },
  { id: "science", name: "Science", color: "#45b7d1", icon: "Flask" },
  { id: "business", name: "Business", color: "#f9ca24", icon: "Briefcase" },
  { id: "personal", name: "Personnel", color: "#6c5ce7", icon: "User" },
  { id: "other", name: "Autre", color: "#a0a0a0", icon: "Files" },
];

// Types pour les filtres
type FilterType = "all" | "scheduled" | "executed";
type SortType = "date" | "name" | "category";

export default function ManagePromptsScreen() {
  const navigation = useNavigation();
  const { prompts, removePrompt, updatePrompt } = usePrompt();

  // États pour la gestion
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortType>("date");

  // États pour l'édition
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState("");
  const [editTime, setEditTime] = useState(new Date());
  const [editRecurring, setEditRecurring] = useState(true);
  const [editCategory, setEditCategory] = useState("other");

  /**
   * 🔍 Filtrage et tri intelligent des prompts
   */
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // Filtrage par type
    if (filterType === "scheduled") {
      filtered = filtered.filter((p) => p.scheduled);
    } else if (filterType === "executed") {
      filtered = filtered.filter((p) => p.response && p.response !== "");
    }

    // Filtrage par catégorie
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => (p as any).category === selectedCategory
      );
    }

    // Recherche textuelle
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.question.toLowerCase().includes(search) ||
          p.response.toLowerCase().includes(search)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.question.localeCompare(b.question);
        case "category":
          const catA = (a as any).category || "other";
          const catB = (b as any).category || "other";
          return catA.localeCompare(catB);
        case "date":
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    return filtered;
  }, [prompts, filterType, selectedCategory, searchText, sortBy]);

  /**
   * ✏️ Démarrer l'édition d'un prompt
   */
  const startEditing = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditText(prompt.question);
    setEditCategory((prompt as any).category || "other");

    if (prompt.scheduled) {
      const editDate = new Date();
      editDate.setHours(prompt.scheduled.hour, prompt.scheduled.minute, 0, 0);
      setEditTime(editDate);
      setEditRecurring(prompt.scheduled.isRecurring ?? true);
    }

    setEditModalVisible(true);
  }, []);

  /**
   * 💾 Sauvegarder les modifications
   */
  const saveEdit = useCallback(async () => {
    if (!editingPrompt || !editText.trim()) {
      Alert.alert("Erreur", "Le texte du prompt ne peut pas être vide.");
      return;
    }

    try {
      const updates: Partial<Prompt> = {
        question: editText.trim(),
        updatedAt: new Date().toISOString(),
        // Ajout de la catégorie (extension du type)
        ...{ category: editCategory },
      };

      // Mise à jour des paramètres de planification si c'est un prompt planifié
      if (editingPrompt.scheduled) {
        updates.scheduled = {
          ...editingPrompt.scheduled,
          hour: editTime.getHours(),
          minute: editTime.getMinutes(),
          isRecurring: editRecurring,
        };
      }

      updatePrompt(editingPrompt.id, updates);
      setEditModalVisible(false);
      setEditingPrompt(null);

      Alert.alert("✅", "Prompt mis à jour avec succès !");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications.");
    }
  }, [
    editingPrompt,
    editText,
    editCategory,
    editTime,
    editRecurring,
    updatePrompt,
  ]);

  /**
   * 🗑️ Supprimer un prompt avec confirmation
   */
  const deletePrompt = useCallback(
    (prompt: Prompt) => {
      const isScheduled = !!prompt.scheduled;
      const message = isScheduled
        ? `Supprimer le prompt planifié :\n"${prompt.question.substring(
            0,
            50
          )}..." ?`
        : `Supprimer le prompt exécuté :\n"${prompt.question.substring(
            0,
            50
          )}..." ?`;

      Alert.alert("🗑️ Confirmation", message, [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            removePrompt(prompt.id);
            Alert.alert("✅", "Prompt supprimé !");
          },
        },
      ]);
    },
    [removePrompt]
  );

  /**
   * 🏷️ Obtenir les informations de catégorie avec icône Phosphor
   */
  const getCategoryInfo = useCallback((categoryId: string) => {
    return CATEGORIES.find((cat) => cat.id === categoryId) || CATEGORIES[5]; // "other" par défaut
  }, []);

  /**
   * 🎨 Rendu d'une icône de catégorie Phosphor
   */
  const renderCategoryIcon = useCallback(
    (iconName: string, size: number = 16, color: string = "#fff") => {
      const iconProps = { size, color, weight: "bold" as const };

      switch (iconName) {
        case "Newspaper":
          return <Newspaper {...iconProps} />;
        case "Desktop":
          return <Desktop {...iconProps} />;
        case "Flask":
          return <Flask {...iconProps} />;
        case "Briefcase":
          return <Briefcase {...iconProps} />;
        case "User":
          return <User {...iconProps} />;
        case "Files":
          return <Files {...iconProps} />;
        default:
          return <Files {...iconProps} />;
      }
    },
    []
  );

  /**
   * 🎨 Rendu d'un item de prompt avec actions
   */
  const renderPromptItem = useCallback(
    ({ item }: { item: Prompt }) => {
      const isScheduled = !!item.scheduled;
      const category = getCategoryInfo((item as any).category || "other");
      const timeText = item.scheduled
        ? `${item.scheduled.hour
            .toString()
            .padStart(2, "0")}:${item.scheduled.minute
            .toString()
            .padStart(2, "0")}`
        : null;

      return (
        <View style={styles.promptItem}>
          {/* Header avec catégorie et statut */}
          <View style={styles.promptHeader}>
            <View style={styles.categoryTag}>
              {renderCategoryIcon(category.icon, 14, category.color)}
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>

            <View style={styles.statusContainer}>
              {isScheduled && (
                <View style={styles.scheduledBadge}>
                  <Clock size={12} color="#81b0ff" />
                  <Text style={styles.scheduledText}>{timeText}</Text>
                </View>
              )}
              {item.response && (
                <View style={styles.executedBadge}>
                  <Text style={styles.executedText}>✅</Text>
                </View>
              )}
            </View>
          </View>

          {/* Contenu du prompt */}
          <AppText style={styles.promptQuestion} numberOfLines={2}>
            {item.question}
          </AppText>

          {/* Réponse si disponible */}
          {item.response && (
            <AppText style={styles.promptResponse} numberOfLines={3}>
              {item.response}
            </AppText>
          )}

          {/* Actions */}
          <View style={styles.promptActions}>
            <AppText style={styles.promptDate}>
              {new Date(item.updatedAt).toLocaleDateString("fr-FR")}
            </AppText>

            <View style={styles.actionButtons}>
              {isScheduled && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => startEditing(item)}
                >
                  <Pencil size={16} color="#81b0ff" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePrompt(item)}
              >
                <Trash size={16} color="#ff4757" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [getCategoryInfo, startEditing, deletePrompt]
  );

  /**
   * 🔑 Key extractor optimisé
   */
  const keyExtractor = useCallback((item: Prompt) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <List size={26} color="#fff" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} bold>
          Gestion des Prompts
        </AppText>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Filtres - CORRIGÉ : Ajout de contentContainerStyle */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent} // ✅ CORRECTION
      >
        {/* Filtre par type */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("all")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "all" && styles.filterTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "scheduled" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("scheduled")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "scheduled" && styles.filterTextActive,
            ]}
          >
            Planifiés
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "executed" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("executed")}
        >
          <Text
            style={[
              styles.filterText,
              filterType === "executed" && styles.filterTextActive,
            ]}
          >
            Exécutés
          </Text>
        </TouchableOpacity>

        {/* Séparateur */}
        <View style={styles.filterSeparator} />

        {/* Filtre par catégorie */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedCategory === "all" && styles.filterTextActive,
            ]}
          >
            Toutes catégories
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategory === category.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            {renderCategoryIcon(
              category.icon,
              14,
              selectedCategory === category.id ? "#fff" : "#888"
            )}
            <Text
              style={[
                styles.filterText,
                selectedCategory === category.id && styles.filterTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Compteur et tri */}
      <View style={styles.controlsContainer}>
        <AppText style={styles.resultCount}>
          {filteredPrompts.length} prompt(s)
        </AppText>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            const nextSort: SortType =
              sortBy === "date"
                ? "name"
                : sortBy === "name"
                ? "category"
                : "date";
            setSortBy(nextSort);
          }}
        >
          <FunnelSimple size={16} color="#81b0ff" />
          <Text style={styles.sortText}>
            {sortBy === "date"
              ? "Date"
              : sortBy === "name"
              ? "Nom"
              : "Catégorie"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des prompts */}
      <FlatList
        data={filteredPrompts}
        keyExtractor={keyExtractor}
        renderItem={renderPromptItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>
              Aucun prompt trouvé avec ces filtres
            </AppText>
          </View>
        }
      />

      {/* Modal d'édition */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <AppText style={styles.modalTitle} bold>
              Éditer le prompt
            </AppText>
            <TouchableOpacity onPress={saveEdit}>
              <Text style={styles.modalSave}>Sauver</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Édition du texte */}
            <View style={styles.modalSection}>
              <AppText style={styles.modalLabel} bold>
                Texte du prompt :
              </AppText>
              <TextInput
                style={styles.modalInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Sélection de catégorie */}
            <View style={styles.modalSection}>
              <AppText style={styles.modalLabel} bold>
                Catégorie :
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categorySelector,
                      editCategory === category.id &&
                        styles.categorySelectorActive,
                    ]}
                    onPress={() => setEditCategory(category.id)}
                  >
                    {renderCategoryIcon(
                      category.icon,
                      16,
                      editCategory === category.id ? category.color : "#888"
                    )}{" "}
                    <Text
                      style={[
                        styles.categorySelectorText,
                        editCategory === category.id && {
                          color: category.color,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Paramètres de planification (si prompt planifié) */}
            {editingPrompt?.scheduled && (
              <>
                <View style={styles.modalSection}>
                  <AppText style={styles.modalLabel} bold>
                    Heure d'exécution :
                  </AppText>
                  <View style={styles.timePickerContainer}>
                    <DateTimePicker
                      mode="time"
                      value={editTime}
                      display="spinner"
                      onChange={(event, selectedTime) => {
                        if (selectedTime) setEditTime(selectedTime);
                      }}
                      textColor="#81b0ff"
                      accentColor="#81b0ff"
                    />
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <View style={styles.switchContainer}>
                    <AppText style={styles.modalLabel} bold>
                      Répéter quotidiennement
                    </AppText>
                    <Switch
                      value={editRecurring}
                      onValueChange={setEditRecurring}
                      trackColor={{ false: "#252525", true: "#81b0ff33" }}
                      thumbColor={editRecurring ? "#81b0ff" : "#666"}
                    />
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  headerTitle: {
    fontSize: 20,
    color: "#fff",
    marginLeft: 16,
  },

  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#fff",
  },

  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  // ✅ AJOUT : Style pour le contenu du ScrollView horizontal
  filtersContent: {
    alignItems: "center", // Centre verticalement les éléments
    paddingRight: 16, // Espace à droite du dernier élément
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },

  filterButtonActive: {
    backgroundColor: "#81b0ff",
  },

  filterText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 4,
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  filterSeparator: {
    width: 1,
    height: 30,
    backgroundColor: "#444",
    marginHorizontal: 8,
  },

  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  resultCount: {
    fontSize: 14,
    color: "#888",
  },

  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },

  sortText: {
    fontSize: 12,
    color: "#81b0ff",
    marginLeft: 4,
  },

  listContainer: {
    paddingHorizontal: 16,
  },

  promptItem: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  promptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4, // ✅ Ajout d'espace après l'icône
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  scheduledBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#81b0ff22",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },

  scheduledText: {
    fontSize: 10,
    color: "#81b0ff",
    marginLeft: 2,
  },

  executedBadge: {
    backgroundColor: "#4CAF5022",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },

  executedText: {
    fontSize: 10,
  },

  promptQuestion: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
    lineHeight: 22,
  },

  promptResponse: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 12,
    lineHeight: 20,
  },

  promptActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  promptDate: {
    fontSize: 12,
    color: "#888",
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  editButton: {
    padding: 8,
    marginRight: 8,
  },

  deleteButton: {
    padding: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },

  // Styles du modal d'édition
  modalContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  modalCancel: {
    fontSize: 16,
    color: "#888",
  },

  modalTitle: {
    fontSize: 18,
    color: "#fff",
  },

  modalSave: {
    fontSize: 16,
    color: "#81b0ff",
    fontWeight: "600",
  },

  modalContent: {
    flex: 1,
    padding: 16,
  },

  modalSection: {
    marginBottom: 24,
  },

  modalLabel: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
  },

  modalInput: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },

  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },

  categorySelectorActive: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#81b0ff",
  },

  categorySelectorText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 4, // ✅ Espace après l'icône
  },

  timePickerContainer: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

/**
 * 📚 FONCTIONNALITÉS PHASE 2 - PARTIE 1
 *
 * ✅ GESTION AVANCÉE :
 * - Liste complète de tous les prompts (planifiés + exécutés)
 * - Édition en place des prompts planifiés
 * - Suppression individuelle avec confirmation
 * - Interface intuitive avec actions visuelles
 *
 * ✅ FILTRAGE ET RECHERCHE :
 * - Filtres par type (tous/planifiés/exécutés)
 * - Filtres par catégorie avec émojis
 * - Recherche textuelle en temps réel
 * - Tri par date/nom/catégorie
 *
 * ✅ CATÉGORISATION :
 * - 6 catégories prédéfinies avec couleurs
 * - Tags visuels avec émojis
 * - Sélection facile dans l'interface d'édition
 * - Filtrage par catégorie
 *
 * ✅ UX OPTIMISÉE :
 * - Interface moderne avec couleurs cohérentes
 * - Modal d'édition complète
 * - Feedback visuel pour toutes les actions
 * - Gestion d'erreurs robuste
 *
 * PROCHAINE ÉTAPE : Ajouter cet écran au DrawerNavigator
 */
