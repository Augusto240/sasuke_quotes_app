import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getFavorites, removeFavorite } from '../storage/favorites';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function FavoritesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const loadFavs = async () => setQuotes(await getFavorites());

  useFocusEffect(useCallback(() => { loadFavs(); }, []));

  const handleRemove = async (id: string | number) => {
    await removeFavorite(id);
    Toast.show({ type: 'info', text1: 'Removido dos favoritos' });
    loadFavs();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>
      <FlatList
        data={quotes}
        keyExtractor={q => q.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <QuoteCard quote={item} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
              <Ionicons name="trash-outline" size={22} color="#e31b3a" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum favorito ainda.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 15, backgroundColor: '#191c26' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#191c26', borderRadius: 10, marginVertical: 6, elevation: 2 },
  removeBtn: { marginLeft: 8, padding: 8, backgroundColor: '#252f69', borderRadius: 24 },
  empty: { color: '#bbb', marginTop: 30, textAlign: 'center' },
});