import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { getRandomQuote } from '../api/sasukeApi';
import { Quote } from '../models/Quote';
import { useApp } from '../contexts/AppContext';
import { darkTheme, lightTheme, Theme } from '../theme';
import i18n from '../i18n';
import ErrorBoundary from '../components/ErrorBoundary';

const { width } = Dimensions.get('window');
const sasukeImage = require('../../assets/images/sasuke.png');
const uchihaLogo = require('../../assets/images/uchiwa.png');
const TAB_BAR_SPACE = Platform.select({ ios: 78, android: 72, default: 72 });
const ACTION_HEIGHT = 56;

export default function HomeScreen() {
  const { theme: themeMode, language, favorites, addFavorite, removeFavorite } = useApp();
  const insets = useSafeAreaInsets();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const isFavorite = !!quote && favorites.some(f => f.id === quote.id);
  const t = (key: string, fallback: string) => {
    try {
      const val = i18n.t(key);
      if (!val || typeof val !== 'string') return fallback;
      if (val.startsWith('[missing') || val === key) return fallback;
      return val;
    } catch {
      return fallback;
    }
  };
  const fetchingRef = useRef(false);

  const fetchQuote = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetching(true);
    try {
      const newQuote = await getRandomQuote();
      setQuote(newQuote);
    } catch (e) {
      console.error('Error fetching quote:', e);
      Toast.show({
        type: 'error',
        text1: t('common.error', 'Erro'),
        text2: t('common.noConnection', 'Sem conexão com a internet'),
      });
    } finally {
      setInitialLoading(false);
      setIsFetching(false);
      fetchingRef.current = false;
    }
  }, []);
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);
  useEffect(() => {
    const last = { t: 0 };
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const acc = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (acc > 2.35 && !initialLoading && !isFetching && now - last.t > 1400) {
        last.t = now;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        fetchQuote();
      }
    });
    return () => sub.remove();
  }, [initialLoading, isFetching, fetchQuote]);

  const handleFavorite = () => {
    if (!quote) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFavorite) {
      removeFavorite(quote.id);
      Toast.show({ type: 'info', text1: t('favorites.removed', 'Removido dos favoritos') });
    } else {
      addFavorite(quote);
      Toast.show({ type: 'success', text1: t('favorites.added', 'Adicionado aos favoritos') });
    }
  };

  const handleSpeak = () => {
    if (!quote) return;
    try {
      Speech.stop();
      const lang = language === 'ja' ? 'ja-JP' : language === 'en' ? 'en-US' : 'pt-BR';
      Speech.speak(quote.quote, { language: lang, pitch: 0.95, rate: 0.9 });
    } catch {}
  };

  const styles = createStyles(theme, themeMode);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ImageBackground source={sasukeImage} style={styles.imageBg} imageStyle={styles.bgImage}>
          <View style={styles.header}>
            <Image source={uchihaLogo} style={styles.logo} />
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
              {t('home.title', "Sasuke's Path")}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {t('home.subtitle', 'Agite para nova citação')}
            </Text>
          </View>
          <View
            style={[
              styles.center,
              { paddingBottom: (TAB_BAR_SPACE ?? 72) + ACTION_HEIGHT + Math.max(insets.bottom, 8) },
            ]}
          >
            <View style={styles.quoteCard}>
              {initialLoading ? (
                <View style={styles.skeleton}>
                  <View style={[styles.skelLine, { width: '92%' }]} />
                  <View style={[styles.skelLine, { width: '80%' }]} />
                  <View style={[styles.skelLine, { width: '60%' }]} />
                </View>
              ) : quote ? (
                <View>
                  <Text style={styles.quoteText} selectable>
                    “{quote.quote}”
                  </Text>
                  {!!quote.source && <Text style={styles.sourceText}>— {quote.source}</Text>}
                  {!!quote.context && <Text style={styles.contextText}>{quote.context}</Text>}
                </View>
              ) : (
                <Text style={styles.errorText}>{t('common.error', 'Erro ao carregar')}</Text>
              )}
            </View>
          </View>
          <View
            style={[
              styles.actionsWrap,
              { bottom: (TAB_BAR_SPACE ?? 72) + Math.max(insets.bottom, 6) },
            ]}
          >
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionSmall}
                onPress={handleSpeak}
                disabled={!quote}
                activeOpacity={0.9}
                accessibilityLabel={t('home.listen', 'Ouvir')}
              >
                <Ionicons name="volume-high-outline" size={20} color={theme.colors.text} />
                <Text style={styles.smallLabel} numberOfLines={1}>
                  {t('home.listen', 'Ouvir')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionMain, isFetching && styles.actionMainLoading]}
                onPress={fetchQuote}
                activeOpacity={0.95}
                accessibilityLabel={t('home.newQuote', 'Nova citação')}
              >
                <Ionicons name="refresh" size={22} color="#fff" />
                <Text style={styles.mainLabel} numberOfLines={1}>
                  {t('home.newQuote', 'Nova citação')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionSmall}
                onPress={handleFavorite}
                disabled={!quote}
                activeOpacity={0.9}
                accessibilityLabel={isFavorite ? t('favorites.saved', 'Favoritado') : t('favorites.save', 'Favoritar')}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? theme.colors.error : theme.colors.text}
                />
                <Text style={styles.smallLabel} numberOfLines={1}>
                  {isFavorite ? t('favorites.saved', 'Favoritado') : t('favorites.save', 'Favoritar')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const createStyles = (theme: Theme, mode: string) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    imageBg: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
    bgImage: { opacity: mode === 'dark' ? 0.08 : 0.05, resizeMode: 'contain' },

    header: { alignItems: 'center', paddingTop: 4, marginBottom: 8 },
    logo: { width: 54, height: 54, resizeMode: 'contain', marginBottom: 10, opacity: 0.92 },
    title: {
      fontSize: Math.min(width * 0.085, 34),
      color: theme.colors.text,
      fontWeight: 'bold',
      fontFamily: 'Uchiha',
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    subtitle: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center' },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    quoteCard: {
      width: '100%',
      maxWidth: 560,
      borderRadius: 18,
      paddingVertical: 20,
      paddingHorizontal: 18,
      backgroundColor: theme.colors.card + 'F2',
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      minHeight: 160,
    },
    quoteText: {
      color: theme.colors.text,
      fontSize: Math.min(width * 0.055, 22),
      lineHeight: Math.min(width * 0.08, 30),
      fontStyle: 'italic',
      textAlign: 'center',
      fontWeight: '500',
    },
    sourceText: { color: theme.colors.textSecondary, fontSize: 13, textAlign: 'right', marginTop: 10, fontWeight: '600' },
    contextText: { color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
    errorText: { color: theme.colors.error, fontSize: 16, textAlign: 'center' },

    skeleton: { gap: 10, paddingVertical: 6 },
    skelLine: { height: 14, backgroundColor: theme.colors.border, borderRadius: 7, alignSelf: 'center' },

    actionsWrap: {
      position: 'absolute',
      left: 16,
      right: 16,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: 10 as any,
    },

    actionSmall: {
      flex: 1,
      minWidth: 0,
      height: ACTION_HEIGHT,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: theme.colors.card + 'E6',
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    smallLabel: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },

    actionMain: {
      flex: 1.2,
      minWidth: 0,
      height: ACTION_HEIGHT,
      paddingHorizontal: 18,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      elevation: 5,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 6,
    },
    actionMainLoading: { opacity: 0.95 },
    mainLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });