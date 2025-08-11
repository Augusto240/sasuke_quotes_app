import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, RefreshControl, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { getRandomQuote } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import { useApp } from '../contexts/AppContext';
import { darkTheme, lightTheme, Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import i18n from '../i18n';
import ErrorBoundary from '../components/ErrorBoundary';

const { width, height } = Dimensions.get('window');
const sasukeImage = require('../../assets/images/sasuke.png');
const uchihaLogo = require('../../assets/images/uchiwa.png');

export default function HomeScreen() {
  const { theme: themeMode, language, favorites, addFavorite, removeFavorite } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFavorite = quote ? favorites.some(fav => fav.id === quote.id) : false;

  const fetchQuote = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const newQuote = await getRandomQuote();
      setQuote(newQuote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      Toast.show({
        type: 'error',
        text1: i18n.t('common.error'),
        text2: i18n.t('common.noConnection')
      });
    } finally {
      setIsInitialLoad(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
    
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      if (acceleration > 2.5 && !isInitialLoad && !refreshing) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        fetchQuote();
      }
    });
    
    return () => subscription.remove();
  }, [fetchQuote, isInitialLoad, refreshing]);

  const handleFavorite = async () => {
    if (!quote) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isFavorite) {
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
  };

  const handleSpeak = () => {
    if (quote) {
      const speechLanguage = language === 'ja' ? 'ja-JP' : language === 'en' ? 'en-US' : 'pt-BR';
      Speech.speak(quote.quote, { 
        language: speechLanguage,
        pitch: 0.9,
        rate: 0.8 
      });
    }
  };

  const onRefresh = useCallback(() => {
    fetchQuote(true);
  }, [fetchQuote]);

  const styles = createStyles(theme, themeMode);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <ImageBackground 
            source={sasukeImage} 
            style={styles.imageBackground} 
            imageStyle={styles.backgroundImage}
          >
            <View style={styles.header}>
              <Image source={uchihaLogo} style={styles.logo} />
              <Text style={styles.title}>{i18n.t('home.title')}</Text>
              <Text style={styles.subtitle}>{i18n.t('home.subtitle')}</Text>
            </View>

            <View style={styles.quoteContainer}>
              {isInitialLoad ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingPlaceholder}>
                    <View style={[styles.loadingLine, { width: '100%' }]} />
                    <View style={[styles.loadingLine, { width: '80%' }]} />
                    <View style={[styles.loadingLine, { width: '60%' }]} />
                  </View>
                </View>
              ) : quote ? (
                <View style={styles.quoteContent}>
                  <Text style={styles.quoteText}>"{quote.quote}"</Text>
                  {quote.source && (
                    <Text style={styles.sourceText}>- {quote.source}</Text>
                  )}
                  {quote.context && (
                    <Text style={styles.contextText}>{quote.context}</Text>
                  )}
                </View>
              ) : null}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handleSpeak}
                disabled={!quote}
                activeOpacity={0.7}
              >
                <Ionicons name="volume-high-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mainButton, isInitialLoad && styles.disabledButton]} 
                onPress={() => fetchQuote()}
                disabled={isInitialLoad}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={28} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handleFavorite} 
                disabled={!quote}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? theme.colors.error : theme.colors.text} 
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const createStyles = (theme: Theme, themeMode: string) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  imageBackground: { 
    flex: 1,
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  backgroundImage: {
    opacity: themeMode === 'dark' ? 0.08 : 0.04,
    resizeMode: 'contain'
  },
  header: { 
    alignItems: 'center', 
    paddingTop: 20,
    marginBottom: 40,
  },
  logo: { 
    width: 60, 
    height: 60, 
    resizeMode: 'contain', 
    marginBottom: 16, 
    opacity: 0.9 
  },
  title: { 
    fontSize: Math.min(width * 0.09, 36), 
    color: theme.colors.text, 
    fontWeight: 'bold', 
    letterSpacing: 1, 
    textShadowColor: theme.colors.primary, 
    textShadowRadius: 10,
    fontFamily: 'Uchiha',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { 
    color: theme.colors.textSecondary, 
    fontSize: 16, 
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  quoteContainer: { 
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    padding: 24,
    backgroundColor: theme.colors.card + 'F5', 
    borderRadius: 20, 
    minHeight: 180, 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  loadingPlaceholder: {
    gap: 12,
  },
  loadingLine: {
    height: 16,
    backgroundColor: theme.colors.border,
    borderRadius: 8,
    alignSelf: 'center',
  },
  quoteContent: {
    padding: 24, 
    backgroundColor: theme.colors.card + 'F5', 
    borderRadius: 20, 
    minHeight: 180, 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  quoteText: { 
    color: theme.colors.text, 
    fontSize: Math.min(width * 0.055, 22), 
    fontStyle: 'italic', 
    textAlign: 'center',
    lineHeight: Math.min(width * 0.075, 30),
    marginBottom: 16,
    fontWeight: '500',
  },
  sourceText: { 
    color: theme.colors.textSecondary, 
    fontSize: 14, 
    textAlign: 'right', 
    marginTop: 8,
    fontWeight: '600'
  },
  contextText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  buttonContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    width: '100%', 
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  mainButton: { 
    backgroundColor: theme.colors.primary, 
    padding: 20, 
    borderRadius: 50, 
    elevation: 6, 
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    minWidth: 70,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6
  },
  iconButton: { 
    padding: 16,
    borderRadius: 40,
    backgroundColor: theme.colors.card + '90',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 56,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});