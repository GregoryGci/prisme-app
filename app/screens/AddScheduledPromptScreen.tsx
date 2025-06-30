import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";
import { List } from "phosphor-react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";

/**
 * Écran permettant d'ajouter et planifier un prompt
 * Compatible avec le Drawer Navigator (pas de prop onClose requise)
 */
export default function AddScheduledPromptScreen() {
  // Hooks pour la navigation et le contexte des prompts
  const navigation = useNavigation();
  const { addPrompt } = usePrompt();

  // États locaux du composant
  const [prompt, setPrompt] = useState(""); // Texte du prompt saisi par l'utilisateur
  const [time, setTime] = useState(new Date(2025, 0, 1, 7, 0)); // Heure par défaut : 7h00
  const [isRecurring, setIsRecurring] = useState(true); // Mode récurrent activé par défaut

  /**
   * Gestion du changement d'heure via le DateTimePicker
   * @param event - Événement du picker (non utilisé)
   * @param selectedTime - Nouvelle heure sélectionnée
   */
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) setTime(selectedTime);
  };

  /**
   * Fonction de planification du prompt
   * Valide les données et enregistre le prompt via le contexte
   */
  const handleSchedule = async () => {
    // Validation : vérifier que le prompt n'est pas vide
    if (!prompt.trim()) {
      Alert.alert("Erreur", "Merci d'écrire un prompt.");
      return;
    }

    // Enregistrement du prompt avec les paramètres de planification
    await addPrompt(prompt, {
      hour: time.getHours(),
      minute: time.getMinutes(),
      isRecurring: isRecurring,
    });

    // Message de confirmation adapté au type de planification
    const message = isRecurring
      ? "Prompt planifié pour tous les jours !"
      : "Prompt planifié pour une seule fois !";

    Alert.alert("✅", message);
    setPrompt(""); // Réinitialiser le champ de saisie

    // Optionnel : rediriger vers l'accueil après planification
    // navigation.navigate("Accueil");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1E1E1E" }}>
      {/* Header avec bouton menu hamburger */}
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
        <Text style={{ fontSize: 18, marginLeft: 16 }}></Text>
      </View>

      {/* Contenu principal avec fermeture du clavier au tap */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {/* Titre de l'écran */}
          <AppText style={styles.title} bold>
            Planifier un Prompt
          </AppText>

          {/* Champ de saisie du prompt */}
          <TextInput
            style={styles.input}
            placeholder="Ex : Donne moi les dernieres nouveautés scientifiques"
            placeholderTextColor={"#888"}
            value={prompt}
            onChangeText={setPrompt}
          />

          {/* Sélecteur d'heure toujours visible */}
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

          {/* Section pour activer/désactiver la récurrence */}
          <View style={styles.recurringContainer}>
            <AppText style={styles.recurringLabel}>
              Répéter tous les jours
            </AppText>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: "#252525", true: "#252525" }}
              thumbColor={isRecurring ? "#81b0ff" : "grey"}
            />
          </View>

          {/* Texte explicatif de la récurrence */}
          <AppText style={styles.recurringInfo}>
            {isRecurring
              ? "Ce prompt se répétera tous les jours à cette heure"
              : "Ce prompt ne se lancera qu'une seule fois"}
          </AppText>

          {/* Bouton de validation pour planifier le prompt */}
          <TouchableOpacity
            style={styles.buttonSchedule}
            onPress={handleSchedule}
          >
            <Text style={styles.buttonText}>Planifier le Prompt</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal centré
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  // Titre de l'écran
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },

  // Champ de saisie du prompt
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#252525",
    color: "#fff",
    // Ombre douce pour l'effet visuel
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  // Conteneur pour centrer le DateTimePicker
  timePickerContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },

  // Affichage de l'heure sélectionnée
  timePreview: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 14,
    color: "#fff",
  },

  // Conteneur pour le switch de récurrence
  recurringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 8,
  },

  // Label du switch de récurrence
  recurringLabel: {
    fontSize: 16,
    color: "#fff",
  },

  // Texte explicatif de la récurrence
  recurringInfo: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    fontStyle: "italic",
  },

  // Bouton principal de planification
  buttonSchedule: {
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#81b0ff",
    // Ombre plus prononcée pour le bouton principal
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  // Style uniforme pour le texte des boutons
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
