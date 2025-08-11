import axios from 'axios';
import { Quote } from '../models/Quote';

const BASE_URL = 'https://sasuke-api.vercel.app/api';

export async function getRandomQuote(): Promise<Quote> {
  try {
    const res = await axios.get(`${BASE_URL}/quote`);
    return res.data;
  } catch (e) {
    console.error('Erro ao buscar citação aleatória:', e);
    return {
      id: 0,
      quote: 'Falha ao carregar citação. Sem ódio, sem poder.',
      source: 'Desconhecido',
      context: 'Erro de conexão ou servidor',
      category: 'Erro'
    };
  }
}

export async function getAllQuotes(): Promise<Quote[]> {
  try {
    const res = await axios.get(`${BASE_URL}/quotes`);
    return res.data.quotes;
  } catch (e) {
    console.error('Erro ao buscar todas as citações:', e);
    return [];
  }
}

export async function getQuotesByCategory(category: string): Promise<Quote[]> {
  try {
    const res = await axios.get(`${BASE_URL}/quotes/category/${category}`);
    return res.data.quotes;
  } catch (e) {
    console.error(`Erro ao buscar citações da categoria ${category}:`, e);
    return [];
  }
}