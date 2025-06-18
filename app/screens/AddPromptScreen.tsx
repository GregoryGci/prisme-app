import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import AppText from '../components/AppText';
import { usePrompt } from '../context/PromptContext';
import { useNavigation } from '@react-navigation/native';

const AddPromptScreen = () => {
  const { addPrompt } = usePrompt();
  const navigation = useNavigation();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const lastRequestRef = useRef<number>(0); // 🕒 garde la dernière requête en mémoire

  const handleAdd = async () => {
    if (!question.trim()) {
      Alert.alert('Erreur', "Merci d'écrire un prompt");
      return;
    }

    const now = Date.now();
    if (now - lastRequestRef.current < 15000) {
      Alert.alert('Trop rapide', 'Merci d’attendre 15 secondes entre deux requêtes');
      return;
    }

    setLoading(true);
    lastRequestRef.current = now;

    try {
      await addPrompt(question);
      setQuestion('');
    } catch (e) {
      console.error('Erreur lors de la requête IA :', e);
      Alert.alert('Erreur', 'Échec de la requête IA');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.header}>Demander à l'IA</AppText>

      <TextInput
        style={styles.input}
        placeholder="Pose ta question..."
        value={question}
        onChangeText={setQuestion}
      />

      <Button
        title={loading ? 'Chargement...' : 'Envoyer'}
        onPress={handleAdd}
        disabled={loading}
      />

      {/* 🆕 Bouton pour accéder à l'écran de planification */}
      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => navigation.navigate('AddScheduledPrompt' as never)}
      >
        <Text style={styles.scheduleText}>
          📅 Planifier ce prompt à une heure précise
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddPromptScreen;

const styles = StyleSheet.create({
  container: { flex: 0.5, padding: 20, justifyContent: 'center' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  // 🆕 Style pour le bouton de planification
  scheduleButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#eaeaea',
    borderRadius: 8,
  },
  scheduleText: {
    fontSize: 16,
  },
});
