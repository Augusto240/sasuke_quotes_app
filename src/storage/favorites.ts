import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '../models/Quote';

const STORAGE_KEY = 'sasuke_favorites';

export async function getFavorites(): Promise<Quote[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function addFavorite(quote: Quote): Promise<void> {
  const favs = await getFavorites();
  if (!favs.some(q => q.id === quote.id)) {
    favs.unshift(quote);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  }
}

export async function removeFavorite(id: string | number): Promise<void> {
  const favs = await getFavorites();
  const newFavs = favs.filter(q => q.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
}

export async function isFavorite(id: string | number): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some(q => q.id === id);
}