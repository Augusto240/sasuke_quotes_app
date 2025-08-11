import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, RefreshControl, ListRenderItem, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Memoized category button component
const CategoryButton = React.memo(({ 
  category, 
  isSelected, 
  onPress, 
  theme 
}: { 
  category: string;
  isSelected: boolean;
  onPress: (cat: string) => void;
  theme: Theme;
}) => (
  <TouchableOpacity 
    style={[
      styles.catBtn(theme), 
      isSelected && styles.catBtnActive(theme)
    ]} 
    onPress={() => onPress(category)}
    activeOpacity={0.7}
  >
    <Text style={[
      styles.catText(theme), 
      isSelected && styles.catTextActive
    ]}>
      {i18n.t(`quotes.categories.${category}`)}
    </Text>
  </TouchableOpacity>
));

// Memoized quote item component
const QuoteItem = React.memo(({ 
  item, 
  favorites, 
  onFavoritePress,
  theme 
}: { 
  item: Quote;
  favorites: Quote[];
  onFavoritePress: (quote: Quote) => void;
  theme: Theme;
}) => {
  const isFav = favorites.some(fav => fav.id === item.id);
  
  return (
    <View style={styles.cardContainer(theme)}>
      <QuoteCard quote={item} />
      <TouchableOpacity 
        style={styles.favButton(theme)} 
        onPress={() => onFavoritePress(item)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isFav ? "heart" : "heart-outline"} 
          size={22} 
          color={isFav ? theme.colors.error : theme.colors.text} 
        />
      </TouchableOpacity>
    </View>
  );
});

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

  const handleCategoryPress = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);
  
  const filteredQuotes = useMemo(() => {
    return allQuotes
      .filter(q => selectedCategory === 'all' || q.category?.toLowerCase() === selectedCategory)
      .filter(q => {
        const searchLower = searchQuery.toLowerCase();
        return q.quote.toLowerCase().includes(searchLower) ||
               (q.source && q.source.toLowerCase().includes(searchLower)) ||
               (q.context && q.context.toLowerCase().includes(searchLower));
      });
  }, [allQuotes, selectedCategory, searchQuery]);

  const renderQuote: ListRenderItem<Quote> = useCallback(({ item }) => (
    <QuoteItem 
      item={item}
      favorites={favorites}
      onFavoritePress={handleFavorite}
      theme={theme}
    />
  ), [favorites, handleFavorite, theme]);

  const renderCategoryItem = useCallback(({ item: cat }: { item: string }) => (
    <CategoryButton 
      category={cat}
      isSelected={selectedCategory === cat}
      onPress={handleCategoryPress}
      theme={theme}
    />
  ), [selectedCategory, handleCategoryPress, theme]);

  const keyExtractor = useCallback((item: Quote) => item.id.toString(), []);
  const categoryKeyExtractor = useCallback((item: string) => item, []);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container(theme)}>
        {/* Header fixo */}
        <View style={styles.headerContainer(theme)}>
          <Text style={styles.title(theme)}>{i18n.t('quotes.title')}</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchBar(theme)}
              placeholder={i18n.t('quotes.searchPlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.voiceButton(theme)}
              onPress={handleVoiceSearch}
              disabled={isListening}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isListening ? "mic" : "mic-outline"} 
                size={22} 
                color={isListening ? theme.colors.primary : theme.colors.text} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.categoryContainer}>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={categoryKeyExtractor}
              renderItem={renderCategoryItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
            />
          </View>
        </View>

        {/* Lista de quotes */}
        <View style={styles.contentContainer}>
          {loading ? (
            <ListSkeleton />
          ) : (
            <FlatList
              data={filteredQuotes}
              keyExtractor={keyExtractor}
              renderItem={renderQuote}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={8}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary]}
                  tintColor={theme.colors.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.empty(theme)}>{i18n.t('quotes.empty')}</Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = {
  container: (theme: Theme) => ({
    flex: 1, 
    backgroundColor: theme.colors.background,
  }),
  headerContainer: (theme: Theme) => ({
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '30',
  }),
  title: (theme: Theme) => ({
    color: theme.colors.text, 
    fontSize: 32, 
    fontWeight: 'bold' as const, 
    marginBottom: 20, 
    fontFamily: 'Uchiha',
  }),
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: (theme: Theme) => ({
    flex: 1,
    backgroundColor: theme.colors.card, 
    color: theme.colors.text, 
    borderRadius: 12, 
    paddingHorizontal: 16,
    paddingVertical: 14, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }),
  voiceButton: (theme: Theme) => ({
    padding: 14,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minWidth: 50,
  }),
  categoryContainer: {
    height: 50,
  },
  catRow: { 
    gap: 12, 
    paddingRight: 20,
    alignItems: 'center' as const,
  },
  catBtn: (theme: Theme) => ({ 
    backgroundColor: theme.colors.card, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }),
  catBtnActive: (theme: Theme) => ({ 
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  }),
  catText: (theme: Theme) => ({ 
    color: theme.colors.textSecondary, 
    fontWeight: '600' as const,
    fontSize: 14,
  }),
  catTextActive: { 
    color: '#fff' 
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center' as const,
  },
  empty: (theme: Theme) => ({ 
    color: theme.colors.textSecondary, 
    textAlign: 'center' as const, 
    fontSize: 16,
  }),
  cardContainer: (theme: Theme) => ({ 
    marginBottom: 16, 
    borderRadius: 14, 
    overflow: 'hidden' as const, 
    backgroundColor: theme.colors.card, 
    elevation: 2, 
    position: 'relative' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }),
  favButton: (theme: Theme) => ({ 
    position: 'absolute' as const, 
    top: 12, 
    right: 12, 
    zIndex: 10, 
    backgroundColor: theme.colors.background + 'DD', 
    borderRadius: 20, 
    padding: 8,
    borderWidth: 1,
    borderColor: theme.colors.border + '50',
  }),
  listContent: {
    paddingBottom: 30,
  },
};