import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getAllQuotes, getQuotesByCategory } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';

const categories = ["all", "Genin", "Shippuden", "Flashback"];

export default function QuotesScreen() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async (category: string) => {
    setLoading(true);
    let data;
    if (category === 'all') {
      data = await getAllQuotes();
      setQuotes(data);
    } else {
      data = await getQuotesByCategory(category);
      setQuotes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes(selected);
  }, [selected]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorar Citações</Text>
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
          data={quotes}
          keyExtractor={q => q.id.toString()}
          renderItem={({ item }) => <QuoteCard quote={item} />}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 15, backgroundColor: '#191c26' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 14 },
  catRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  catBtn: { backgroundColor: '#252f69', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  catBtnActive: { backgroundColor: '#e31b3a' },
  catText: { color: '#aaa', fontWeight: 'bold' },
  catTextActive: { color: '#fff' },
  loading: { color: '#fff', marginTop: 50, alignSelf: 'center' },
});