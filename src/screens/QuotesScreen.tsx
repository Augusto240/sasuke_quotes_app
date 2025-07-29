import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getAllQuotes } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';
import { addFavorite, getFavorites, removeFavorite } from '../storage/favorites';
import { Ionicons } from '@expo/vector-icons';

const categories = ["Todas", "Genin", "Shippuden", "Flashback"];

export default function QuotesScreen() {
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [quotesData, favsData] = await Promise.all([getAllQuotes(), getFavorites()]);
    setAllQuotes(quotesData);
    setFavorites(favsData.map(q => q.id));
    setLoading(false);
  };
  
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );
  
  useEffect(() => {
    loadData();
  }, []);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs.map(q => q.id));
  };

  const handleFavorite = async (quote: Quote) => {
    const isFav = favorites.includes(quote.id);
    if (isFav) {
      await removeFavorite(quote.id);
      Toast.show({ type: 'error', text1: 'Removido dos favoritos' });
    } else {
      await addFavorite(quote);
      Toast.show({ type: 'success', text1: 'Adicionado aos favoritos!' });
    }
    await loadFavorites();
  };
  
  const filteredQuotes = useMemo(() => {
    return allQuotes
      .filter(q => selectedCategory === 'Todas' || q.category === selectedCategory)
      .filter(q => q.quote.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allQuotes, selectedCategory, searchQuery]);

  const renderQuote = ({ item }: { item: Quote }) => {
    const isFav = favorites.includes(item.id);
    return (
      <View style={styles.cardContainer}>
        <QuoteCard quote={item} />
        <TouchableOpacity style={styles.favButton} onPress={() => handleFavorite(item)}>
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? "#ff304f" : "#fff"} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar Citações</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por palavra-chave..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={cat => cat}
          renderItem={({item: cat}) => (
            <TouchableOpacity style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        />
      </View>
      {loading ? (
        <Text style={styles.loading}>Carregando...</Text>
      ) : (
        <FlatList
          data={filteredQuotes}
          keyExtractor={q => q.id.toString()}
          renderItem={renderQuote}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 15, backgroundColor: '#101010' },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20, fontFamily: 'Uchiha' },
  searchBar: { backgroundColor: '#181818', color: '#fff', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
  catRow: { gap: 12, marginBottom: 14, paddingRight: 20 },
  catBtn: { backgroundColor: '#27272a', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  catBtnActive: { backgroundColor: '#e31b3a' },
  catText: { color: '#aaa', fontWeight: 'bold' },
  catTextActive: { color: '#fff' },
  loading: { color: '#fff', marginTop: 50, alignSelf: 'center' },
  cardContainer: { marginBottom: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#181818', elevation: 2, position: 'relative' },
  favButton: { position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, padding: 6 },
});