import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Quote } from '../models/Quote';

type Props = {
  quote: Quote;
};

export default function QuoteCard({ quote }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.quote}>{quote.quote}</Text>
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
    marginVertical: 10,
    backgroundColor: '#191c26',
    borderRadius: 10,
    padding: 18,
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#fff',
    marginBottom: 10,
  },
  details: {
    marginTop: 5,
  },
  detail: {
    fontSize: 12,
    color: '#bbb',
  },
  category: {
    fontSize: 13,
    color: '#e31b3a',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});