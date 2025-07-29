import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { getRandomQuote } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import { addFavorite, isFavorite, removeFavorite } from '../storage/favorites';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [fav, setFav] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const [subscription, setSubscription] = useState<any>(null);

  const fetchQuote = async () => {
    setLoading(true);
    Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }).start(async () => {
      const q = await getRandomQuote();
      setQuote(q);
      setFav(await isFavorite(q.id));
      Animated.timing(fade, { toValue: 1, duration: 120, useNativeDriver: true }).start();
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchQuote();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  useEffect(() => {
    const sub = Accelerometer.addListener(accelerometerData => {
      const total = Math.abs(accelerometerData.x) + Math.abs(accelerometerData.y) + Math.abs(accelerometerData.z);
      if (total > 2) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        fetchQuote();
      }
    });
    setSubscription(sub);
    return () => sub && sub.remove();
  }, []);

  const handleFavorite = async () => {
    if (!quote) return;
    if (fav) {
      await removeFavorite(quote.id);
      setFav(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await addFavorite(quote);
      setFav(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSpeak = () => {
    if (quote) {
      Speech.speak(quote.quote);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sasuke's Path</Text>
      <Animated.View style={{ opacity: fade, width: '100%' }}>
        <View style={styles.quoteBox}>
          {loading || !quote ? (
            <ActivityIndicator size="large" color="#e31b3a" />
          ) : (
            <>
              <Text style={styles.quote}>"{quote.quote}"</Text>
              <Text style={styles.context}>{quote.context}</Text>
              <Text style={styles.info}>{quote.source} - <Text style={styles.category}>{quote.category}</Text></Text>
            </>
          )}
        </View>
      </Animated.View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn} onPress={fetchQuote}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.btnText}>Nova</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleFavorite} disabled={!quote}>
          <Ionicons name={fav ? "heart" : "heart-outline"} size={20} color={fav ? "#ff304f" : "white"} />
          <Text style={styles.btnText}>{fav ? "Desfavoritar" : "Favoritar"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleSpeak}>
          <Ionicons name="volume-high" size={20} color="white" />
          <Text style={styles.btnText}>Ouvir</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.tip}>Dica: Agite o celular para nova citação</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: '#191c26' },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 50, marginBottom: 30, letterSpacing: 0.5, color: '#e31b3a' },
  quoteBox: { borderRadius: 12, backgroundColor: '#131936', padding: 28, minWidth: 300, minHeight: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  quote: { fontSize: 20, color: '#fff', fontStyle: 'italic', marginBottom: 16, textAlign: 'center' },
  context: { fontSize: 16, color: '#bbb', marginBottom: 4, textAlign: 'center' },
  info: { fontSize: 14, color: '#bbb', textAlign: 'center' },
  category: { color: '#e31b3a', fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 16, marginVertical: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e31b3a', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 30, marginHorizontal: 5 },
  btnText: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 15 },
  tip: { color: '#aaa', marginTop: 15, fontSize: 13 },
});