import React from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import Markdown from "react-native-markdown-display";

const { width } = Dimensions.get("window");

type Props = {
  title: string;
  content: string;
  source: string;
};

export default function GlassCard({ title, content, source }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        <Markdown style={markdownStyles}>{content}</Markdown>

        <Text style={styles.source}>Source : {source}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: "center",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fdfcfb",
    borderRadius: 20,
    padding: 24,
    // Ombre moderne pour iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    // Ombre pour Android
    elevation: 20,
    // Bordure subtile pour plus de définition
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    // Effet de profondeur supplémentaire
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  source: {
    marginTop: 18,
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    fontWeight: "500",
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: "#2d2d2d",
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  bullet_list: {
    marginBottom: 10,
  },
  ordered_list: {
    marginBottom: 10,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  paragraph: {
    marginBottom: 8,
  },
});
