import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '../models/Quote';

interface AppState {
  favorites: Quote[];
  theme: 'dark' | 'light';
  language: 'pt' | 'en' | 'ja';
  hasSeenOnboarding: boolean;
  isLoading: boolean;
}

interface AppContextValue extends AppState {
  addFavorite: (quote: Quote) => void;
  removeFavorite: (id: number) => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'pt' | 'en' | 'ja') => void;
  markOnboardingComplete: () => void;
  setLoading: (loading: boolean) => void;
}

const initialState: AppState = {
  favorites: [],
  theme: 'dark',
  language: 'pt',
  hasSeenOnboarding: false,
  isLoading: false,
};

type AppAction =
  | { type: 'SET_FAVORITES'; payload: Quote[] }
  | { type: 'ADD_FAVORITE'; payload: Quote }
  | { type: 'REMOVE_FAVORITE'; payload: number }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_LANGUAGE'; payload: 'pt' | 'en' | 'ja' }
  | { type: 'MARK_ONBOARDING_COMPLETE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<AppState> };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'ADD_FAVORITE':
      if (state.favorites.some(q => q.id === action.payload.id)) return state;
      return { ...state, favorites: [action.payload, ...state.favorites] };
    case 'REMOVE_FAVORITE':
      return { ...state, favorites: state.favorites.filter(q => q.id !== action.payload) };
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'MARK_ONBOARDING_COMPLETE':
      return { ...state, hasSeenOnboarding: true };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [favorites, theme, language, onboarding] = await Promise.all([
          AsyncStorage.getItem('favorites'),
          AsyncStorage.getItem('theme'),
          AsyncStorage.getItem('language'),
          AsyncStorage.getItem('hasSeenOnboarding'),
        ]);

        dispatch({
          type: 'HYDRATE',
          payload: {
            favorites: favorites ? JSON.parse(favorites) : [],
            theme: (theme as 'dark' | 'light') || 'dark',
            language: (language as 'pt' | 'en' | 'ja') || 'pt',
            hasSeenOnboarding: onboarding === 'true',
          },
        });
      } catch (error) {
        console.error('Error loading app state:', error);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  useEffect(() => {
    AsyncStorage.setItem('theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    AsyncStorage.setItem('language', state.language);
  }, [state.language]);

  useEffect(() => {
    AsyncStorage.setItem('hasSeenOnboarding', state.hasSeenOnboarding.toString());
  }, [state.hasSeenOnboarding]);

  const contextValue: AppContextValue = {
    ...state,
    addFavorite: (quote: Quote) => dispatch({ type: 'ADD_FAVORITE', payload: quote }),
    removeFavorite: (id: number) => dispatch({ type: 'REMOVE_FAVORITE', payload: id }),
    toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
    setLanguage: (lang: 'pt' | 'en' | 'ja') => dispatch({ type: 'SET_LANGUAGE', payload: lang }),
    markOnboardingComplete: () => dispatch({ type: 'MARK_ONBOARDING_COMPLETE' }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}