import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabs from "./BottomTabs";
import AddScheduledPromptScreen from "../screens/AddScheduledPromptScreen";

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
      <Stack.Screen
        name="AddScheduledPrompt"
        component={AddScheduledPromptScreen}
        options={{ title: "Planifier un Prompt" }}
      />
    </Stack.Navigator>
  );
}
