import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import AddScheduledPromptScreen from "../screens/AddScheduledPromptScreen";
import ManagePromptsScreen from "../screens/ManagePromptsScreen"; // ✅ Nouveau import
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

/**
 * 🚀 Drawer Navigator avec nouvel écran de gestion
 * Style original conservé avec cohérence visuelle
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
        drawerActiveTintColor: "#939393", // ✅ Couleur originale conservée
        drawerActiveBackgroundColor: "#444", // ✅ Background original conservé
        drawerItemStyle: {
          borderRadius: 12, // ✅ BorderRadius original conservé
        },
      }}
    >
      {/* Écran principal - Feed des prompts */}
      <Drawer.Screen name="Accueil" component={HomeScreen} />
      
      {/* ✅ NOUVEAU : Gestion avancée des prompts */}
      <Drawer.Screen
        name="Gérer les prompts"
        component={ManagePromptsScreen}
      />
      
      {/* Planification de nouveaux prompts */}
      <Drawer.Screen
        name="Planifier un prompt"
        component={AddScheduledPromptScreen}
      />
      
      {/* Profil utilisateur */}
      <Drawer.Screen name="Profil" component={ProfileScreen} />
      
      {/* Paramètres de l'application */}
      <Drawer.Screen name="Paramètres" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

/**
 * 📚 STYLE ORIGINAL CONSERVÉ :
 * 
 * ✅ COULEURS IDENTIQUES :
 * - backgroundColor: "#323232" (drawer)
 * - drawerActiveTintColor: "#939393" 
 * - drawerActiveBackgroundColor: "#444"
 * - color: "#fff" (labels)
 * 
 * ✅ DIMENSIONS IDENTIQUES :
 * - width: 250 (drawer)
 * - fontSize: 16 (labels)
 * - marginLeft: 8 (labels)
 * - borderRadius: 12 (items)
 * 
 * ✅ STRUCTURE IDENTIQUE :
 * - CustomDrawerContent preserved
 * - screenOptions structure maintained
 * - All original screens preserved
 * 
 * ➕ AJOUT MINIMAL :
 * - ManagePromptsScreen ajouté en 2ème position
 * - Import ajouté en haut
 * - Ordre logique maintenu
 */