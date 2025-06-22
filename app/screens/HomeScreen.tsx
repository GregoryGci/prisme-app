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
  Platform,
} from "react-native";
import GlassCard from "../components/GlassCard";
import AppText from "../components/AppText";
import { usePrompt } from "../context/PromptContext";
import { Trash, Plus, List } from "phosphor-react-native";
import AddScheduledPromptScreen from "./AddScheduledPromptScreen";
import { useNavigation, DrawerActions } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const { prompts, checkAndRunScheduledPrompts, clearPrompts, addPrompt } =
    usePrompt();
  const [refreshing, setRefreshing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState("");

  useEffect(() => {
    checkAndRunScheduledPrompts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkAndRunScheduledPrompts();
    setRefreshing(false);
  };

  const feedPrompts = prompts.filter((p) => p.response);

  const handleSearchSubmit = async () => {
    if (searchPrompt.trim()) {
      await addPrompt(searchPrompt);
      setSearchPrompt("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔼 Header avec recherche centrée */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <List size={26} weight="bold" />
        </TouchableOpacity>

        <View style={styles.searchHeaderBar}>
          <TextInput
            value={searchPrompt}
            onChangeText={setSearchPrompt}
            placeholder="Tape ton prompt ici..."
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="send"
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity onPress={() => setShowScheduleModal(true)}>
          <Plus size={26} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* 💬 Feed de prompts exécutés */}
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

      {/* ➕ Modal planification */}
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
    backgroundColor: "transparent",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  searchHeaderBar: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 6 : 4,

    // 🌫️ Ombre douce
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
});
