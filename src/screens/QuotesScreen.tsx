import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getAllQuotes, getQuotesByCategory } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';
import { addFavorite, getFavorites, removeFavorite } from '../storage/favorites';
import { Ionicons } from '@expo/vector-icons';

const categories = ["all", "Genin", "Shippuden", "Flashback"];

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selected, setSelected] = useState('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchQuotes = async (category: string) => {
    setLoading(true);
    const data = category === 'all' ? await getAllQuotes() : await getQuotesByCategory(category);
    setQuotes(data);
    setLoading(false);
  };

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs.map(q => q.id));
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    fetchQuotes(selected);
  }, [selected]);

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

  const filtered = quotes.filter(q => q.quote.toLowerCase().includes(search.toLowerCase()));

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
        placeholder="Buscar por palavra-chave..."
        placeholderTextColor="#bbb"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />
      <View style={styles.catRow}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} style={[styles.catBtn, selected === cat && styles.catBtnActive]} onPress={() => setSelected(cat)}>
            <Text style={[styles.catText, selected === cat && styles.catTextActive]}>
              {cat === 'all' ? 'Todas' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <Text style={styles.loading}>Carregando...</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={q => q.id.toString()}
          renderItem={renderQuote}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 15, backgroundColor: '#191c26' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 14 },
  input: { backgroundColor: '#131936', color: '#fff', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 16 },
  catRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  catBtn: { backgroundColor: '#252f69', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  catBtnActive: { backgroundColor: '#e31b3a' },
  catText: { color: '#aaa', fontWeight: 'bold' },
  catTextActive: { color: '#fff' },
  loading: { color: '#fff', marginTop: 50, alignSelf: 'center' },
  cardContainer: { marginBottom: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#16182c', elevation: 2, position: 'relative' },
  favButton: { position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: '#20223b', borderRadius: 24, padding: 6 },
});