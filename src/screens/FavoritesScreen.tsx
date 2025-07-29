import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getFavorites } from '../storage/favorites';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';
import { useFocusEffect } from '@react-navigation/native';

export default function FavoritesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const loadFavs = async () => {
    setQuotes(await getFavorites());
  };

  useFocusEffect(useCallback(() => { loadFavs(); }, []));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>
      <FlatList
        data={quotes}
        keyExtractor={q => q.id.toString()}
        renderItem={({ item }) => <QuoteCard quote={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum favorito ainda.</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 15, backgroundColor: '#191c26' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 14 },
  empty: { color: '#bbb', marginTop: 30, textAlign: 'center' },
});