import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, ImageBackground, Image } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { getRandomQuote } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import { addFavorite, isFavorite, removeFavorite } from '../storage/favorites';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const sasukeImage = require('../../assets/images/sasuke.png');
const uchihaLogo = require('../../assets/images/uchiwa.png');

export default function HomeScreen() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(async () => {
      const newQuote = await getRandomQuote();
      setQuote(newQuote);
      setIsFav(await isFavorite(newQuote.id));
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, []);

  useEffect(() => {
    fetchQuote();
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (total > 2.2 && !loading) fetchQuote();
    });
    return () => sub.remove();
  }, [fetchQuote, loading]);

  const handleFavorite = async () => {
    if (!quote) return;
    if (isFav) {
      await removeFavorite(quote.id);
      Toast.show({ type: 'error', text1: 'Removido dos Favoritos' });
    } else {
      await addFavorite(quote);
      Toast.show({ type: 'success', text1: 'Adicionado aos Favoritos!' });
    }
    setIsFav(!isFav);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSpeak = () => {
    if (quote) {
      Speech.speak(quote.quote, { language: 'ja-JP' });
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={sasukeImage} style={styles.imageBackground} imageStyle={{ opacity: 0.09 }}>
        <View style={styles.header}>
          <Image source={uchihaLogo} style={styles.logo} />
          <Text style={styles.title}>Sasuke's Path</Text>
          <Text style={styles.subtitle}>Agite para nova citação</Text>
        </View>
        <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
          {loading || !quote ? (
            <ActivityIndicator size="large" color="#e31b3a" />
          ) : (
            <>
              <Text style={styles.quoteText}>"{quote.quote}"</Text>
              <Text style={styles.sourceText}>{quote.source ? `- ${quote.source}` : ''}</Text>
            </>
          )}
        </Animated.View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSpeak}>
            <Ionicons name="volume-high-outline" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mainButton} onPress={fetchQuote}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleFavorite} disabled={!quote}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={26} color={isFav ? "#ff304f" : "white"} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010' },
  imageBackground: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 80 },
  logo: { width: 60, height: 60, resizeMode: 'contain', marginBottom: 12, opacity: 0.8 },
  title: { fontSize: 36, color: '#fff', fontWeight: 'bold', letterSpacing: 1, textShadowColor: '#e31b3a', textShadowRadius: 10 },
  subtitle: { color: '#888', fontSize: 15, marginBottom: 10 },
  quoteContainer: { padding: 20, marginHorizontal: 20, backgroundColor: 'rgba(24,24,24,0.90)', borderRadius: 16, minHeight: 140, justifyContent: 'center', borderWidth: 1, borderColor: '#27272a', marginBottom: 30 },
  quoteText: { color: '#fff', fontSize: 22, fontStyle: 'italic', textAlign: 'center' },
  sourceText: { color: '#aaa', fontSize: 13, textAlign: 'right', marginTop: 15 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%', paddingBottom: 50 },
  mainButton: { backgroundColor: '#e31b3a', padding: 20, borderRadius: 50, elevation: 8, shadowColor: '#e31b3a' },
  iconButton: { padding: 15 },
});