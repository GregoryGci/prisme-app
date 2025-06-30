// App.tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { PromptProvider } from "./app/context/PromptContext";
import "react-native-gesture-handler";
import DrawerNavigator from "./app/navigation/DrawerNavigator";


export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("./app/assets/fonts/SFUIText-Regular.ttf"),
    "Inter-Bold": require("./app/assets/fonts/SFUIText-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  return (
     <PromptProvider>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </PromptProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center"},
});
