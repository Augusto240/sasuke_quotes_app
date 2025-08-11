import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, RefreshControl, ListRenderItem, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { getAllQuotes } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import QuoteCard from '../components/QuoteCard';
import { useApp } from '../contexts/AppContext';
import { darkTheme, lightTheme, Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';
import { ListSkeleton } from '../components/LoadingSkeleton';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import ErrorBoundary from '../components/ErrorBoundary';

const { width } = Dimensions.get('window');

const categories = ["all", "genin", "shippuden", "flashback"];

export default function QuotesScreen() {
  const { theme: themeMode, favorites, addFavorite, removeFavorite } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const { startListening, isListening, transcript } = useVoiceSearch();
  
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const quotesData = await getAllQuotes();
      setAllQuotes(quotesData);
    } catch (error) {
      console.error('Error loading quotes:', error);
      Toast.show({
        type: 'error',
        text1: i18n.t('common.error'),
        text2: i18n.t('common.noConnection')
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  const handleFavorite = useCallback((quote: Quote) => {
    const isFav = favorites.some(fav => fav.id === quote.id);
    if (isFav) {
      removeFavorite(quote.id);
      Toast.show({ 
        type: 'info', 
        text1: i18n.t('favorites.removed') 
      });
    } else {
      addFavorite(quote);
      Toast.show({ 
        type: 'success', 
        text1: i18n.t('favorites.added') 
      });
    }
  }, [favorites, addFavorite, removeFavorite]);

  const handleVoiceSearch = useCallback(async () => {
    const transcript = await startListening();
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [startListening]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);
  
  const filteredQuotes = useMemo(() => {
    return allQuotes
      .filter(q => selectedCategory === 'all' || q.category.toLowerCase() === selectedCategory)
      .filter(q => 
        q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.context.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [allQuotes, selectedCategory, searchQuery]);

  const renderQuote: ListRenderItem<Quote> = useCallback(({ item }) => {
    const isFav = favorites.some(fav => fav.id === item.id);
    return (
      <View style={styles.cardContainer}>
        <QuoteCard quote={item} />
        <TouchableOpacity 
          style={styles.favButton} 
          onPress={() => handleFavorite(item)}
        >
          <Ionicons 
            name={isFav ? "heart" : "heart-outline"} 
            size={24} 
            color={isFav ? theme.colors.error : theme.colors.text} 
          />
        </TouchableOpacity>
      </View>
    );
  }, [favorites, handleFavorite, theme.colors]);

  const renderCategoryItem = useCallback(({ item: cat }: { item: string }) => (
    <TouchableOpacity 
      style={[
        styles.catBtn, 
        selectedCategory === cat && styles.catBtnActive
      ]} 
      onPress={() => setSelectedCategory(cat)}
    >
      <Text style={[
        styles.catText, 
        selectedCategory === cat && styles.catTextActive
      ]}>
        {i18n.t(`quotes.categories.${cat}`)}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, theme.colors]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 160,
    offset: 160 * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: Quote) => item.id.toString(), []);

  const styles = createStyles(theme);

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('quotes.title')}</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder={i18n.t('quotes.searchPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.voiceButton}
            onPress={handleVoiceSearch}
            disabled={isListening}
          >
            <Ionicons 
              name={isListening ? "mic" : "mic-outline"} 
              size={24} 
              color={isListening ? theme.colors.primary : theme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          renderItem={renderCategoryItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        />

        {loading ? (
          <ListSkeleton />
        ) : (
          <FlatList
            data={filteredQuotes}
            keyExtractor={keyExtractor}
            renderItem={renderQuote}
            getItemLayout={getItemLayout}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={5}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>{i18n.t('quotes.empty')}</Text>
            }
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        )}
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
    marginBottom: 20, 
    fontFamily: 'Uchiha' 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: { 
    flex: 1,
    backgroundColor: theme.colors.card, 
    color: theme.colors.text, 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  voiceButton: {
    marginLeft: 12,
    padding: 14,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catRow: { 
    gap: 12, 
    marginBottom: 20, 
    paddingRight: 20 
  },
  catBtn: { 
    backgroundColor: theme.colors.card, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  catBtnActive: { 
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  catText: { 
    color: theme.colors.textSecondary, 
    fontWeight: '600' 
  },
  catTextActive: { 
    color: '#fff' 
  },
  empty: { 
    color: theme.colors.textSecondary, 
    marginTop: 50, 
    textAlign: 'center', 
    fontSize: 16 
  },
  cardContainer: { 
    marginBottom: 12, 
    borderRadius: 12, 
    overflow: 'hidden', 
    backgroundColor: theme.colors.card, 
    elevation: 2, 
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  favButton: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    zIndex: 10, 
    backgroundColor: theme.colors.background + 'CC', 
    borderRadius: 24, 
    padding: 8 
  },
});