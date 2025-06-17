import React from "react";
import { View, StyleSheet} from "react-native";
import AppText from "../components/AppText";

export default function AddPromptScreen() {
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>Ajouter un Prompt</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: '600' },
});
