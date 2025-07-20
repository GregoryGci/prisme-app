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
    'Satoshi-Light': require("./app/assets/fonts/Satoshi-Light.otf"),
    'Satoshi-Regular': require("./app/assets/fonts/Satoshi-Regular.otf"),
    'Satoshi-Medium': require("./app/assets/fonts/Satoshi-Medium.otf"), 
    'Satoshi-Bold': require("./app/assets/fonts/Satoshi-Bold.otf"),
    'Satoshi-Black': require("./app/assets/fonts/Satoshi-Black.otf"),
    'Satoshi-Italic': require("./app/assets/fonts/Satoshi-Italic.otf"),
    'Satoshi-LightItalic': require("./app/assets/fonts/Satoshi-LightItalic.otf"),
    'Satoshi-BoldItalic': require("./app/assets/fonts/Satoshi-BoldItalic.otf"),
    'Satoshi-BlackItalic': require("./app/assets/fonts/Satoshi-BlackItalic.otf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
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
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
