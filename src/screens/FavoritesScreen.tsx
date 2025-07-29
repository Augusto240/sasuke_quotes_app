import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getFavorites, removeFavorite } from '../storage/favorites';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const loadFavs = async () => setQuotes(await getFavorites());

  useFocusEffect(useCallback(() => { loadFavs(); }, []));

  const handleRemove = async (id: number) => {
    await removeFavorite(id);
    Toast.show({ type: 'info', text1: 'Removido dos favoritos' });
    loadFavs();
  };

  const renderFavorite = ({ item }: { item: Quote }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <QuoteCard quote={item} />
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#e31b3a" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Citações Favoritas</Text>
      <FlatList
        data={quotes}
        keyExtractor={q => q.id.toString()}
        renderItem={renderFavorite}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma citação favoritada ainda.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 15, backgroundColor: '#101010' },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 14, fontFamily: 'Uchiha' },
  empty: { color: '#bbb', marginTop: 30, textAlign: 'center', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  removeBtn: { marginLeft: 10, padding: 8, backgroundColor: '#181818', borderRadius: 24 },
});