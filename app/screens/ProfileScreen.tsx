import React from "react";
import { View, StyleSheet} from "react-native";
import AppText from "../components/AppText";
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>Mon Profil</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "600" },
});
