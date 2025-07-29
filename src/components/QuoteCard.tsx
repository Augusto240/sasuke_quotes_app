import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Quote } from '../models/Quote';

export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <View style={styles.card}>
      <Text style={styles.quote}>"{quote.quote}"</Text>
      <View style={styles.details}>
        <Text style={styles.detail}>{quote.context}</Text>
        <Text style={styles.detail}>{quote.source}</Text>
        <Text style={styles.category}>{quote.category}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: '#16182c',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 12,
    elevation: 3,
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  details: { marginTop: 2 },
  detail: { fontSize: 13, color: '#bbb', textAlign: 'center' },
  category: { fontSize: 13, color: '#e31b3a', marginTop: 8, alignSelf: 'flex-end' },
});