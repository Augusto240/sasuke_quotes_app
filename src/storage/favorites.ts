import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '../models/Quote';

const FAV_KEY = 'sasuke_favorites';

export async function getFavorites(): Promise<Quote[]> {
  const data = await AsyncStorage.getItem(FAV_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addFavorite(quote: Quote): Promise<void> {
  const favs: Quote[] = await getFavorites();
  if (!favs.find(q => q.id === quote.id)) {
    favs.push(quote);
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }
}

export async function removeFavorite(id: number): Promise<void> {
  const favs: Quote[] = await getFavorites();
  const filtered = favs.filter(q => q.id !== id);
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(filtered));
}

export async function isFavorite(id: number): Promise<boolean> {
  const favs: Quote[] = await getFavorites();
  return !!favs.find(q => q.id === id);
}