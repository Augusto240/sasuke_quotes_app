import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Quote } from '../models/Quote';
import { useApp } from '../contexts/AppContext';
import { darkTheme, lightTheme, Theme } from '../theme';

export default function QuoteCard({ quote }: { quote: Quote }) {
  const { theme: themeMode } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const styles = createStyles(theme);

  return (
    <View style={styles.card}>
      <Text style={styles.quote}>"{quote.quote}"</Text>
      <View style={styles.details}>
        {quote.context && <Text style={styles.detail}>{quote.context}</Text>}
        {quote.source && <Text style={styles.detail}>{quote.source}</Text>}
        {quote.category && <Text style={styles.category}>{quote.category}</Text>}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowRadius: 12,
    elevation: 3,
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  details: { marginTop: 2 },
  detail: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center' },
  category: { fontSize: 13, color: theme.colors.primary, marginTop: 8, alignSelf: 'flex-end' },
});