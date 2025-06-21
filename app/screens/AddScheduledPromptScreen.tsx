import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";

export default function AddScheduledPromptScreen() {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <AppText style={styles.title} bold>
          Planifier un Prompt
        </AppText>

        <TextInput
          style={styles.input}
          placeholder="Ex : 3 news tech importantes"
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
          Heure sélectionnée : {time.getHours()}h{time.getMinutes().toString().padStart(2, "0")}
        </AppText>

        <Button title="Planifier le Prompt" onPress={handleSchedule} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  timePreview: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 12,
  },
});
