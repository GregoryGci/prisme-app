import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

export default function CustomDrawerContent(props: any) {
  return (
    <View style={{ flex: 1 }}>
      {/* Liste des liens */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.links}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Bouton logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => alert("Déconnexion")}
      >
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    alignItems: "center",
    backgroundColor: "#e7e7e7",
    paddingBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  links: {
    paddingTop: 50,
  },
  logoutButton: {
    padding: 20,
    borderTopColor: "#ccc",
  },
  logoutText: {
    fontSize: 16,
    color: "rgb(252, 71, 71)",
    fontWeight: "500",
    marginLeft: 8,
  },
});
