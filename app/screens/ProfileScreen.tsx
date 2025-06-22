import React from "react";
import AppText from "../components/AppText";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { List } from "phosphor-react-native";

export default function ProfileScreen() {
  const navigation = useNavigation();
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
        <Text style={{ fontSize: 18, marginLeft: 16 }}>Profil</Text>
      </View>
      <View style={styles.container}>
        <AppText style={styles.text}></AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "600" },
});
