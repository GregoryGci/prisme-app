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
        <Text style={styles.logoutText}>Log Out</Text>
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
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  links: {
    paddingTop: 10,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  logoutText: {
    fontSize: 16,
    color: "red",
    fontWeight: "500",
  },
});
