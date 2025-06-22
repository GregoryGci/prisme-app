import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { List, Plus } from "phosphor-react-native";

type HeaderProps = {
  onMenuToggle: () => void;
  onAddPress: () => void;
  searchValue: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
};

export default function Header({
  onMenuToggle,
  onAddPress,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onMenuToggle}>
        <List size={28} />
      </TouchableOpacity>
      <TextInput
        style={styles.search}
        value={searchValue}
        onChangeText={onSearchChange}
        placeholder="Rechercher..."
        onSubmitEditing={onSearchSubmit}
      />
      <TouchableOpacity onPress={onAddPress}>
        <Plus size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", padding: 12 },
  search: {
    flex: 1,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
});
