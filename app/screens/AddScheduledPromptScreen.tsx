import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";
import { List } from "phosphor-react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";

export default function AddScheduledPromptScreen({
  onClose,
}: {
  onClose: () => void;
}) {
  const navigation = useNavigation();
  const { addPrompt } = usePrompt();
  const [prompt, setPrompt] = useState("");
  const [time, setTime] = useState(new Date(2025, 0, 1, 7, 0)); // 7h00 par défaut
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedTime) setTime(selectedTime);
  };

  const handleSchedule = async () => {
    if (!prompt.trim()) {
      Alert.alert("Erreur", "Merci d’écrire un prompt.");
      return;
    }

    await addPrompt(prompt, {
      hour: time.getHours(),
      minute: time.getMinutes(),
    });

    Alert.alert("✅", "Prompt planifié !");
    setPrompt("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#1E1E1E" }}>
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
          <List size={26} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, marginLeft: 16 }}></Text>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <AppText style={styles.title} bold>
            Planifier un Prompt
          </AppText>

          <TextInput
            style={styles.input}
            placeholder="Ex : 3 news tech importantes"
            placeholderTextColor={"#888"}
            value={prompt}
            onChangeText={setPrompt}
          />

          <Button title="Choisir l’heure" onPress={() => setShowPicker(true)} />
          {showPicker && (
            <DateTimePicker
              mode="time"
              value={time}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <AppText style={styles.timePreview}>
            Heure sélectionnée : {time.getHours()}h
            {time.getMinutes().toString().padStart(2, "0")}
          </AppText>

          <Button title="Planifier le Prompt" onPress={handleSchedule} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: { fontSize: 22, textAlign: "center", marginBottom: 20, color: "#fff" },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#252525",
    // 🌫️ Ombre douce
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  timePreview: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 12,
  },
});
