import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '../models/Quote';

type Theme = 'light' | 'dark';
type Language = 'pt' | 'en' | 'ja';

interface AppContextType {
  theme: Theme;
  language: Language;
  favorites: Quote[];
  hasSeenOnboarding: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  addFavorite: (quote: Quote) => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: '@sasuke_app:theme',
  LANGUAGE: '@sasuke_app:language',
  FAVORITES: '@sasuke_app:favorites',
  ONBOARDING: '@sasuke_app:onboarding_complete',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [language, setLanguageState] = useState<Language>('pt');
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on app start
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [savedTheme, savedLanguage, savedFavorites, savedOnboarding] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
      ]);

      if (savedTheme) setThemeState(savedTheme as Theme);
      if (savedLanguage) setLanguageState(savedLanguage as Language);
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      }
      if (savedOnboarding) setHasSeenOnboarding(JSON.parse(savedOnboarding));
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = useCallback(async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const setLanguage = useCallback(async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }, []);

  const addFavorite = useCallback(async (quote: Quote) => {
    try {
      const exists = favorites.some(fav => fav.id === quote.id);
      if (exists) return;

      const newFavorites = [...favorites, quote];
      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error adding favorite:', error);
      // Revert on error
      setFavorites(favorites);
    }
  }, [favorites]);

  const removeFavorite = useCallback(async (id: number) => {
    try {
      const newFavorites = favorites.filter(fav => fav.id !== id);
      setFavorites(newFavorites);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Revert on error
      setFavorites(favorites);
    }
  }, [favorites]);

  const markOnboardingComplete = useCallback(async () => {
    try {
      setHasSeenOnboarding(true);
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(true));
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  const value: AppContextType = {
    theme,
    language,
    favorites,
    hasSeenOnboarding,
    setTheme,
    setLanguage,
    addFavorite,
    removeFavorite,
    markOnboardingComplete,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}