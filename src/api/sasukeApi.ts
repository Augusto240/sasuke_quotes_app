import axios from 'axios';
import { Quote } from '../models/Quote';

const BASE_URL = 'https://sasuke-api.vercel.app/api';

export async function getRandomQuote(): Promise<Quote> {
  try {
    const res = await axios.get(`${BASE_URL}/quote`);
    return res.data;
  } catch (e) {
    return { id: 0, quote: 'Falha ao carregar citação.', source: '', context: '', category: '' };
  }
}

export async function getAllQuotes(): Promise<Quote[]> {
  try {
    const res = await axios.get(`${BASE_URL}/quotes`);
    return res.data.quotes;
  } catch (e) {
    return [];
  }
}

export async function getQuotesByCategory(category: string): Promise<Quote[]> {
  try {
    const res = await axios.get(`${BASE_URL}/quotes/category/${category}`);
    return res.data.quotes;
  } catch (e) {
    return [];
  }
}