import React, { useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import GlassCard from "../components/GlassCard";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";
import { Trash } from "phosphor-react-native";

export default function HomeScreen() {
  const { prompts, checkAndRunScheduledPrompts, clearPrompts } = usePrompt();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkAndRunScheduledPrompts();
    setRefreshing(false);
  };
  // ✅ On exécute les prompts planifiés au lancement si l'heure est passée
  useEffect(() => {
    checkAndRunScheduledPrompts();
  }, []);

  // ✅ On n’affiche que les prompts ayant une réponse
  const feedPrompts = prompts.filter((p) => p.response);

  return (
    <SafeAreaView style={styles.container}>
      <AppText style={styles.header}>Feed</AppText>

      <FlatList
        data={[...feedPrompts].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GlassCard
            title={item.question}
            content={item.response}
            source={item.source}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* 🗑 Bouton flottant pour vider les prompts exécutés */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          Alert.alert(
            "Vider le feed",
            "Tu es sûr de vouloir supprimer tous les prompts exécutés ?",
            [
              { text: "Annuler", style: "cancel" },
              { text: "Vider", onPress: () => clearPrompts() },
            ]
          )
        }
      >
        <Trash size={26} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#202020	",
    textShadowColor: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    padding: 14,

    zIndex: 10,
  },
});
