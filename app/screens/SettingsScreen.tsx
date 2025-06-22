import React from "react";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { TouchableOpacity, View, Text } from "react-native";
import { List } from "phosphor-react-native";

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* Header personnalisé */}

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
        <Text style={{ fontSize: 18, marginLeft: 16 }}></Text>
      </View>

      {/* Contenu principal */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Paramètres de l'application</Text>
      </View>
    </View>
  );
}
