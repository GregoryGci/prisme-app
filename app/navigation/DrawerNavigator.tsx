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

// ✅ Composant bouton menu ≡ (affiché sur tous les headers)
function MenuButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <List size={26} weight="bold" />
    </TouchableOpacity>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // tu as choisi de gérer les headers manuellement
        drawerStyle: {
          backgroundColor: "#fdfdfd",
          width: 260,
        },
        drawerLabelStyle: {
          fontSize: 16,
          marginLeft: -8,
        },
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
