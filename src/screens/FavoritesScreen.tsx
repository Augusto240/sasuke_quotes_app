import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useApp } from '../contexts/AppContext';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';
import { Ionicons } from '@expo/vector-icons';
import { darkTheme, lightTheme, Theme } from '../theme';
import i18n from '../i18n';
import ErrorBoundary from '../components/ErrorBoundary';

export default function FavoritesScreen() {
  const { theme: themeMode, favorites, removeFavorite } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const handleRemove = useCallback((id: number) => {
    removeFavorite(id);
    Toast.show({
      type: 'info',
      text1: i18n.t('favorites.removed'),
    });
  }, [removeFavorite]);

  const renderFavorite = useCallback(({ item }: { item: Quote }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <QuoteCard quote={item} />
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
        <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  ), [handleRemove, theme]);

  const styles = createStyles(theme);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('favorites.title')}</Text>
        <FlatList
          data={favorites}
          keyExtractor={q => q.id.toString()}
          renderItem={renderFavorite}
          ListEmptyComponent={<Text style={styles.empty}>{i18n.t('favorites.empty')}</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>
    </ErrorBoundary>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.background
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 14,
    fontFamily: 'Uchiha'
  },
  empty: {
    color: theme.colors.textSecondary,
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  removeBtn: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: theme.colors.card,
    borderRadius: 24
  },
});