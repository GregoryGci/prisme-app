import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, FlatList, Text, View } from "react-native";
import AppText from "../components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import { usePrompt } from "../context/PromptContext";

export default function HomeScreen() {
  const { prompts, checkAndRunScheduledPrompts } = usePrompt();

  useEffect(() => {
    checkAndRunScheduledPrompts(); // 🔁 Mise à jour des prompts planifiés
  }, []);

  // 🕒 Calcul de l’heure de mise à jour la plus récente
  const lastUpdateTime = prompts
    .map((p) => new Date(p.updatedAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <LinearGradient
      colors={["#E1E3F9", "#FBFBFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <AppText style={styles.header} bold>
          Feed
        </AppText>

        {lastUpdateTime && (
          <Text style={styles.info}>
            🕒 Feed mis à jour à{" "}
            {lastUpdateTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}

        <FlatList
          data={prompts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GlassCard
              title={item.question}
              content={item.response}
              source={item.source}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "black",
  },
  info: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 12,
    color: "#888",
  },
    listContent: {
      paddingBottom: 16,
    },
  });
