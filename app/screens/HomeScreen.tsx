import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ImageBackground,
} from "react-native";
import GlassCard from "../components/GlassCard";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";
import { Trash, Plus, List } from "phosphor-react-native";
import AddScheduledPromptScreen from "./AddScheduledPromptScreen";
import { Animated, Easing } from "react-native";

export default function HomeScreen() {
  const { prompts, checkAndRunScheduledPrompts, clearPrompts, addPrompt } =
    usePrompt();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);

  const [searchPrompt, setSearchPrompt] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const animatedHeight = useState(new Animated.Value(0))[0]; // ← contrôle de l'affichage  const [searchPrompt, setSearchPrompt] = React.useState("");

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

  const handleSearchSubmit = async () => {
    if (searchPrompt.trim()) {
      await addPrompt(searchPrompt);
      setSearchPrompt("");
      setSearchVisible(false);
    }
  };
  const toggleSearchBar = () => {
    if (searchVisible) {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => setSearchVisible(false));
    } else {
      setSearchVisible(true);
      Animated.timing(animatedHeight, {
        toValue: 40,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔼 Header avec icônes */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={toggleSearchBar}>
          <List size={26} weight="bold" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowScheduleModal(true)}>
          <Plus size={26} weight="bold"/>
        </TouchableOpacity>
      </View>

      {/* 🔍 Barre de recherche contextuelle */}
      <>
        {searchVisible && (
          <Animated.View style={[styles.searchBar, { height: animatedHeight }]}>
            <TextInput
              value={searchPrompt}
              onChangeText={setSearchPrompt}
              placeholder="Tape ton prompt ici..."
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="send"
              style={styles.searchInput}
            />
          </Animated.View>
        )}

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
      </>

      {/* 🗑 Supprimer tous les prompts exécutés */}
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

      {/* ➕ Modal pour planifier un prompt */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <AddScheduledPromptScreen onClose={() => setShowScheduleModal(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 24,
    marginRight: 24,
  },

  searchBar: {
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 24,
    marginRight: 24,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    padding: 14,
    backgroundColor: "#eee",
    borderRadius: 32,
    zIndex: 10,
  },
});
