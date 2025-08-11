import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, ImageBackground, Image, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
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
import { QuoteCardSkeleton } from '../components/LoadingSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';

const sasukeImage = require('../../assets/images/sasuke.png');
const uchihaLogo = require('../../assets/images/uchiwa.png');

export default function HomeScreen() {
  const { theme: themeMode, language, favorites, addFavorite, removeFavorite } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isFavorite = quote ? favorites.some(fav => fav.id === quote.id) : false;

  const fetchQuote = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    Animated.timing(fadeAnim, { 
      toValue: 0, 
      duration: 200, 
      useNativeDriver: true 
    }).start(async () => {
      try {
        const newQuote = await getRandomQuote();
        setQuote(newQuote);
        
        Animated.parallel([
          Animated.timing(fadeAnim, { 
            toValue: 1, 
            duration: 500, 
            useNativeDriver: true 
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, { 
              toValue: 1.05, 
              duration: 200, 
              useNativeDriver: true 
            }),
            Animated.timing(scaleAnim, { 
              toValue: 1, 
              duration: 200, 
              useNativeDriver: true 
            }),
          ])
        ]).start();
      } catch (error) {
        console.error('Error fetching quote:', error);
        Toast.show({
          type: 'error',
          text1: i18n.t('common.error'),
          text2: i18n.t('common.noConnection')
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    });
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    fetchQuote();
    
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      if (acceleration > 2.5 && !loading && !refreshing) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        fetchQuote();
      }
    });
    
    return () => subscription.remove();
  }, [fetchQuote, loading, refreshing]);

  const handleFavorite = async () => {
    if (!quote) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isFavorite) {
      removeFavorite(quote.id);
      Toast.show({ 
        type: 'error', 
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
    setRefreshing(true);
    fetchQuote(false);
  }, [fetchQuote]);

  const styles = createStyles(theme);

  return (
    <ErrorBoundary>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <ImageBackground 
          source={sasukeImage} 
          style={styles.imageBackground} 
          imageStyle={{ opacity: themeMode === 'dark' ? 0.09 : 0.05 }}
        >
          <View style={styles.header}>
            <Image source={uchihaLogo} style={styles.logo} />
            <Text style={styles.title}>{i18n.t('home.title')}</Text>
            <Text style={styles.subtitle}>{i18n.t('home.subtitle')}</Text>
          </View>

          <Animated.View 
            style={[
              styles.quoteContainer, 
              { 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {loading || !quote ? (
              <QuoteCardSkeleton />
            ) : (
              <>
                <Text style={styles.quoteText}>"{quote.quote}"</Text>
                {quote.source && (
                  <Text style={styles.sourceText}>- {quote.source}</Text>
                )}
                {quote.context && (
                  <Text style={styles.contextText}>{quote.context}</Text>
                )}
              </>
            )}
          </Animated.View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleSpeak}
              disabled={!quote}
            >
              <Ionicons name="volume-high-outline" size={26} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.mainButton, loading && styles.disabledButton]} 
              onPress={() => fetchQuote()}
              disabled={loading}
            >
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleFavorite} 
              disabled={!quote}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={26} 
                color={isFavorite ? theme.colors.error : theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    </ErrorBoundary>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  imageBackground: { 
    minHeight: '100%',
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 60
  },
  header: { 
    alignItems: 'center', 
    paddingTop: 40 
  },
  logo: { 
    width: 70, 
    height: 70, 
    resizeMode: 'contain', 
    marginBottom: 16, 
    opacity: 0.9 
  },
  title: { 
    fontSize: 38, 
    color: theme.colors.text, 
    fontWeight: 'bold', 
    letterSpacing: 1, 
    textShadowColor: theme.colors.primary, 
    textShadowRadius: 15,
    fontFamily: 'Uchiha',
    marginBottom: 8
  },
  subtitle: { 
    color: theme.colors.textSecondary, 
    fontSize: 16, 
    fontStyle: 'italic'
  },
  quoteContainer: { 
    padding: 24, 
    marginHorizontal: 20, 
    backgroundColor: theme.colors.card + 'F0', 
    borderRadius: 20, 
    minHeight: 160, 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  quoteText: { 
    color: theme.colors.text, 
    fontSize: 24, 
    fontStyle: 'italic', 
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12
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
  buttonRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    width: '100%', 
    paddingHorizontal: 40,
    marginTop: 30
  },
  mainButton: { 
    backgroundColor: theme.colors.primary, 
    padding: 22, 
    borderRadius: 60, 
    elevation: 8, 
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6
  },
  disabledButton: {
    opacity: 0.6
  },
  iconButton: { 
    padding: 18,
    borderRadius: 50,
    backgroundColor: theme.colors.card + '80'
  },
});