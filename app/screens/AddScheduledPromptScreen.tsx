import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";
import {
  List,
  Newspaper,
  Desktop,
  Flask,
  Briefcase,
  User,
  Files,
} from "phosphor-react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";

// ✅ Catégories prédéfinies avec icônes Phosphor (identiques à ManagePromptsScreen)
const CATEGORIES = [
  { id: "news", name: "Actualités", color: "#ff6b6b", icon: "Newspaper" },
  { id: "tech", name: "Technologie", color: "#4ecdc4", icon: "Desktop" },
  { id: "science", name: "Science", color: "#45b7d1", icon: "Flask" },
  { id: "business", name: "Business", color: "#f9ca24", icon: "Briefcase" },
  { id: "personal", name: "Personnel", color: "#6c5ce7", icon: "User" },
  { id: "other", name: "Autre", color: "#a0a0a0", icon: "Files" },
];

/**
 * 📅 Écran de planification de prompts - Phase 2 avec catégories
 *
 * 🆕 Nouvelles fonctionnalités :
 * - Sélection de catégorie avec interface visuelle
 * - Styles cohérents avec ManagePromptsScreen
 * - Support complet des catégories dans le contexte
 *
 * 🎨 Style original conservé avec ajouts subtils
 */
export default function AddScheduledPromptScreen() {
  // Hooks pour la navigation et le contexte des prompts
  const navigation = useNavigation();
  const { addPrompt, notificationsEnabled, requestNotificationPermissions } =
    usePrompt(); // ✅ NOUVEAU

  // États locaux du composant - identiques + catégorie
  const [prompt, setPrompt] = useState(""); // Texte du prompt saisi par l'utilisateur
  const [time, setTime] = useState(new Date(2025, 0, 1, 7, 0)); // Heure par défaut : 7h00
  const [isRecurring, setIsRecurring] = useState(true); // Mode récurrent activé par défaut
  const [selectedCategory, setSelectedCategory] = useState("other"); // ✅ NOUVEAU : Catégorie sélectionnée

  /**
   * ✅ NOUVEAU : Vérifier les permissions au montage du composant
   */
  useEffect(() => {
    const checkNotifications = async () => {
      if (!notificationsEnabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert(
            "Notifications désactivées",
            "Pour recevoir des rappels de vos prompts planifiés, activez les notifications dans les paramètres.",
            [
              { text: "Plus tard", style: "cancel" },
              {
                text: "Paramètres",
                onPress: () => {
                  // Optionnel : ouvrir les paramètres système
                  console.log("Redirection vers paramètres système");
                },
              },
            ]
          );
        }
      }
    };

    checkNotifications();
  }, [notificationsEnabled, requestNotificationPermissions]);
  /**
   * 🕐 Formatage optimisé de l'heure (invisible pour l'utilisateur)
   */
  const formattedTime = useMemo(() => {
    return time.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [time]);

  /**
   * 🔄 Gestion du changement d'heure via le DateTimePicker
   * @param event - Événement du picker (non utilisé)
   * @param selectedTime - Nouvelle heure sélectionnée
   */
  const handleTimeChange = useCallback((event: any, selectedTime?: Date) => {
    if (selectedTime) setTime(selectedTime);
  }, []);

  /**
   * 🔄 Toggle optimisé de la récurrence
   */
  const toggleRecurring = useCallback((value: boolean) => {
    setIsRecurring(value);
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
   * 🏷️ Sélection de catégorie optimisée
   */
  const selectCategory = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  /**
   * 📅 Fonction de planification du prompt avec validation temporelle
   * Valide les données et enregistre le prompt via le contexte
   */
  const handleSchedule = useCallback(async () => {
    // Validation : vérifier que le prompt n'est pas vide
    if (!prompt.trim()) {
      Alert.alert("Erreur", "Merci d'écrire un prompt.");
      return;
    }

    // ✅ NOUVEAU : Validation temporelle pour les prompts non récurrents
    if (!isRecurring) {
      const scheduledTime = new Date();
      scheduledTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      const now = new Date();

      if (scheduledTime <= now) {
        Alert.alert(
          "Erreur de planification",
          "L'heure sélectionnée est dans le passé. Choisissez une heure future ou activez la récurrence quotidienne."
        );
        return;
      }
    }

    try {
      // ✅ Enregistrement du prompt avec catégorie
      await addPrompt(prompt, {
        hour: time.getHours(),
        minute: time.getMinutes(),
        isRecurring: isRecurring,
        category: selectedCategory,
      });

      // Message de confirmation adapté au type de planification
      const categoryInfo = CATEGORIES.find(
        (cat) => cat.id === selectedCategory
      );
      const categoryName = categoryInfo ? categoryInfo.name : "Autre";

      const message = isRecurring
        ? `Prompt "${categoryName}" planifié pour tous les jours à ${formattedTime} ! 🔔`
        : `Prompt "${categoryName}" planifié pour une seule fois à ${formattedTime} ! ⏰`;

      Alert.alert("✅", message);
      setPrompt(""); // Réinitialiser le champ de saisie
      setSelectedCategory("other"); // Réinitialiser la catégorie

      // Optionnel : rediriger vers l'accueil après planification
      // navigation.navigate("Accueil");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de planifier le prompt. Réessayez.");
    }
  }, [prompt, time, isRecurring, selectedCategory, addPrompt, formattedTime]);

  /**
   * 🎯 Fermeture du clavier optimisée
   */
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#1E1E1E" }}>
      {/* Header avec bouton menu hamburger - STYLE ORIGINAL EXACT */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <List size={26} color="#fff" />
        </TouchableOpacity>
        <AppText style={{ fontSize: 18, marginLeft: 16 }}></AppText>
      </View>

      {/* Contenu principal avec scroll et fermeture du clavier */}
      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Titre de l'écran - STYLE ORIGINAL EXACT */}
          <AppText style={styles.title} bold>
            Planifier un Prompt
          </AppText>

          {/* Champ de saisie du prompt - STYLE ORIGINAL EXACT */}
          <TextInput
            style={styles.input}
            placeholder="Ex : Donne moi les dernieres nouveautés scientifiques"
            placeholderTextColor={"#888"}
            value={prompt}
            onChangeText={setPrompt}
          />

          {/* ✅ NOUVEAU : Sélection de catégorie */}
          <View style={styles.categorySection}>
            <AppText style={styles.categoryLabel}>
              Catégorie du prompt :
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScrollView}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && [
                      styles.categoryButtonActive,
                      { borderColor: category.color },
                    ],
                  ]}
                  onPress={() => selectCategory(category.id)}
                >
                  {renderCategoryIcon(
                    category.icon,
                    16,
                    selectedCategory === category.id ? category.color : "#888"
                  )}
                  <AppText
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && {
                        color: category.color,
                      },
                    ]}
                  >
                    {category.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Sélecteur d'heure toujours visible - STYLE ORIGINAL EXACT */}
          <View style={styles.timePickerContainer}>
            <DateTimePicker
              mode="time"
              value={time}
              display="spinner"
              onChange={handleTimeChange}
              textColor="#81b0ff"
              accentColor="#81b0ff"
            />
          </View>

          {/* Section pour activer/désactiver la récurrence - STYLE ORIGINAL EXACT */}
          <View style={styles.recurringContainer}>
            <AppText style={styles.recurringLabel}>
              Répéter tous les jours
            </AppText>
            <Switch
              value={isRecurring}
              onValueChange={toggleRecurring}
              trackColor={{ false: "#252525", true: "#252525" }}
              thumbColor={isRecurring ? "#81b0ff" : "grey"}
            />
          </View>

          {/* Texte explicatif de la récurrence - Amélioré avec catégorie */}
          <AppText style={styles.recurringInfo}>
            {(() => {
              const categoryInfo = CATEGORIES.find(
                (cat) => cat.id === selectedCategory
              );
              const categoryName = categoryInfo ? categoryInfo.name : "Autre";
              return isRecurring
                ? `Ce prompt "${categoryName}" se répétera tous les jours à ${formattedTime}`
                : `Ce prompt "${categoryName}" ne se lancera qu'une seule fois à ${formattedTime}`;
            })()}
          </AppText>

          {/* Bouton de validation pour planifier le prompt - STYLE ORIGINAL EXACT */}
          <TouchableOpacity
            style={styles.buttonSchedule}
            onPress={handleSchedule}
          >
            <AppText style={styles.buttonText}>Planifier le Prompt</AppText>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}

/**
 * 🎨 STYLES ORIGINAUX + Nouveaux styles pour catégories
 */
const styles = StyleSheet.create({
  // Conteneur principal centré - ORIGINAL EXACT (changé en ScrollView)
  container: {
    flex: 1,
    padding: 20,
  },

  // Titre de l'écran - ORIGINAL EXACT
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
    marginTop: 20, // Ajouté pour compenser le scroll
  },

  // Champ de saisie du prompt - ORIGINAL EXACT
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#252525",
    color: "#fff",
    // Ombre douce pour l'effet visuel - ORIGINAL EXACT
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    fontFamily: "FiraCode-VariableFont",
  },

  // ✅ NOUVEAU : Section de sélection de catégorie
  categorySection: {
    marginBottom: 20,
  },

  categoryLabel: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 12,
  },

  categoryScrollView: {
    marginBottom: 8,
  },

  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },

  categoryButtonActive: {
    backgroundColor: "#333",
    borderWidth: 2,
    // borderColor sera défini dynamiquement
  },

  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },

  categoryText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 4, // ✅ Ajout d'espace après l'icône
  },

  // Conteneur pour centrer le DateTimePicker - ORIGINAL EXACT
  timePickerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },

  // Affichage de l'heure sélectionnée - ORIGINAL EXACT
  timePreview: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 14,
    color: "#fff",
  },

  // Conteneur pour le switch de récurrence - ORIGINAL EXACT
  recurringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 8,
  },

  // Label du switch de récurrence - ORIGINAL EXACT
  recurringLabel: {
    fontSize: 16,
    color: "#fff",
  },

  // Texte explicatif de la récurrence - ORIGINAL EXACT
  recurringInfo: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    fontStyle: "italic",
    lineHeight: 20, // Ajouté pour meilleure lisibilité
  },

  // Bouton principal de planification - ORIGINAL EXACT
  buttonSchedule: {
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 30, // Augmenté pour l'espace en bas
    backgroundColor: "#81b0ff",
    // Ombre plus prononcée pour le bouton principal - ORIGINAL EXACT
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  // Style uniforme pour le texte des boutons - ORIGINAL EXACT
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

/**
 * 📚 NOUVELLES FONCTIONNALITÉS PHASE 2 AJOUTÉES
 *
 * ✅ SUPPORT DES CATÉGORIES :
 * - Interface de sélection visuelle avec émojis
 * - 6 catégories prédéfinies avec couleurs cohérentes
 * - Sélection active avec bordure colorée
 * - Intégration dans le texte explicatif
 * - Réinitialisation après planification
 *
 * ✅ UX AMÉLIORÉE :
 * - ScrollView pour gérer le contenu étendu
 * - Scroll horizontal pour les catégories
 * - Feedback visuel pour la sélection
 * - Message de confirmation avec catégorie
 * - Espacement optimisé pour mobile
 *
 * ✅ STYLE CONSERVÉ :
 * - Tous les styles originaux préservés
 * - Nouvelles sections intégrées harmonieusement
 * - Cohérence visuelle avec ManagePromptsScreen
 * - Même palette de couleurs et effets
 *
 * ✅ PERFORMANCE :
 * - useCallback pour toutes les fonctions
 * - useMemo pour les calculs répétitifs
 * - Optimisation des re-renders
 * - Gestion mémoire optimisée
 *
 * Cette version étend votre écran existant avec le système de
 * catégorisation tout en conservant parfaitement votre design
 * et votre UX originaux.
 */
