import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import AddScheduledPromptScreen from "../screens/AddScheduledPromptScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { List } from "phosphor-react-native";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

/**
 * Composant principal du Drawer Navigator
 * Contient les écrans principaux de l'application
 * Utilise un composant personnalisé pour le contenu du drawer
 */

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: "#323232",
          width: 250,
        },
        drawerLabelStyle: {
          color: "#fff",
          fontSize: 16,
          marginLeft: 8,
        },
        drawerActiveTintColor: "#939393", // ← ✅ Couleur personnalisée de sélection
      }}
    >
      <Drawer.Screen name="Accueil" component={HomeScreen} />
      <Drawer.Screen
        name="Planifier un prompt"
        component={AddScheduledPromptScreen}
      />
      <Drawer.Screen name="Profil" component={ProfileScreen} />
      <Drawer.Screen name="Paramètres" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}
