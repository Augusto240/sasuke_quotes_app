import axios from 'axios';
import { Quote } from '../models/Quote';

const BASE_URL = 'https://sasuke-api.vercel.app/api';

/**
 * Busca uma citação aleatória do Sasuke na API.
 * @returns Uma promessa que resolve para um objeto Quote.
 */
export async function getRandomQuote(): Promise<Quote> {
  try {
    const res = await axios.get(`${BASE_URL}/quote`);
    return res.data;
  } catch (e) {
    console.error('Erro ao buscar citação aleatória:', e);
    // Retorna uma citação de fallback em caso de erro
    return {
      id: 0,
      quote: 'Falha ao carregar citação. Sem ódio, sem poder.',
      source: 'Desconhecido',
      context: 'Erro de conexão ou servidor',
      category: 'Erro'
    };
  }
}

/**
 * Busca todas as citações disponíveis na API.
 * @returns Uma promessa que resolve para um array de objetos Quote.
 */
export async function getAllQuotes(): Promise<Quote[]> {
  try {
    const res = await axios.get(`${BASE_URL}/quotes`);
    return res.data.quotes;
  } catch (e) {
    console.error('Erro ao buscar todas as citações:', e);
    return [];
  }
}

/**
 * Filtra as citações por categoria.
 * @param category A categoria para filtrar (ex: 'Genin', 'Shippuden').
 * @returns Uma promessa que resolve para um array de objetos Quote da categoria especificada.
 */
export async function getQuotesByCategory(category: string): Promise<Quote[]> {
  try {
    const res = await axios.get(`${BASE_URL}/quotes/category/${category}`);
    return res.data.quotes;
  } catch (e) {
    console.error(`Erro ao buscar citações da categoria ${category}:`, e);
    return [];
  }
}