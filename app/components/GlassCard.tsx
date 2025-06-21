import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type Props = { title: string; content: string; source: string };

export default function GlassCard({ title, content, source }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EBDEFF', '#DCC7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <BlurView intensity={50} tint="light" style={styles.blur}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.content}>{content}</Text>
          <Text style={styles.source}>Source: {source}</Text>
        </BlurView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  gradient: { flex: 1 },
  blur: { padding: 20, borderRadius: 25 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  content: { marginTop: 10, fontSize: 16, color: '#444' },
  source: { marginTop: 12, fontSize: 14, color: '#666', fontStyle: 'italic' },
});
