// app/screens/HomeScreen.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, FlatList } from 'react-native';
import AppText from '../components/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';

const data = [
  { id: '1', title: 'Actu IA', content: 'OpenAI sort GPT-5.', source: 'Le Monde' },
];

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#E9E9F9', '#FBFBFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1}}
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <AppText style={styles.header} bold>Feed</AppText>
        <FlatList
          data={data}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <GlassCard
              title={item.title}
              content={item.content}
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
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#614AD3',
  },
  listContent: {
    paddingBottom: 20,
  },
});
