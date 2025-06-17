import React from "react";
import { ReactElement } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { BlurView } from "expo-blur";
import HomeScreen from "../screens/HomeScreen";
import AddPromptScreen from "../screens/AddPromptScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { House, Plus, User } from "phosphor-react-native";

// On crée le type de props de TabBarIcon
type TabBarIconProps = {
  icon: ReactElement;
};

// Le composant TabBarIcon reçoit maintenant des props typées
const TabBarIcon = ({ icon }: TabBarIconProps) => {
  return (
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icon}
    </View>
  );
};

const Tab = createBottomTabNavigator();

const CustomTabBar = (props: any) => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        borderRadius: 45,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
      }}
    >
      <BlurView
        intensity={80}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: "#ffffff",
          paddingHorizontal: 20,
        }}
      >
        {props.state.routes.map((route: any, index: number) => {
          const { options } = props.descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = props.state.index === index;

          const onPress = () => {
            const event = props.navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              props.navigation.navigate(route.name);
            }
          };

          let iconComponent;

          switch (route.name) {
            case "Home":
              iconComponent = (
                <House
                  size={32}
                  weight={isFocused ? "bold" : "regular"}
                  color={isFocused ? "#614AD3" : "#9CA3AF"}
                />
              );
              break;
            case "Add":
              iconComponent = (
                <Plus
                  size={32}
                  weight={isFocused ? "bold" : "regular"}
                  color={isFocused ? "#614AD3" : "#9CA3AF"}
                />
              );
              break;
            case "Profile":
              iconComponent = (
                <User
                  size={32}
                  weight={isFocused ? "bold" : "regular"}
                  color={isFocused ? "#614AD3" : "#9CA3AF"}
                />
              );
              break;
            default:
              iconComponent = (
                <House size={32} color="#9CA3AF" weight="regular" />
              );
          }

          return (
            <View key={index} style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
                onTouchStart={onPress}
              >
                <TabBarIcon icon={iconComponent} />
              </View>
            </View>
          );
        })}
      </BlurView>
    </View>
  );
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add" component={AddPromptScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
