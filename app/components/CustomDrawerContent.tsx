import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, } from "react-native";
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
  // Style pour la liste des liens
  links: {
    paddingTop: 50,
  },
  // Style pour le bouton de déconnexion
  logoutButton: {
    padding: 20,
    borderTopColor: "#ccc",
  },
  // Style pour le texte de déconnexion
  logoutText: {
    fontSize: 16,
    color: "rgb(252, 71, 71)",
    fontWeight: "500",
    marginLeft: 8,
  },
});
