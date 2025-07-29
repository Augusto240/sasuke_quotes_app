import axios from 'axios';
import { Quote } from '../models/Quote';

const BASE_URL = 'https://sasuke-api.vercel.app/api';

export async function getRandomQuote(): Promise<Quote> {
  const res = await axios.get(`${BASE_URL}/quote`);
  return res.data;
}

export async function getAllQuotes(): Promise<Quote[]> {
  const res = await axios.get(`${BASE_URL}/quotes`);
  return res.data.quotes;
}

export async function getQuotesByCategory(category: string): Promise<Quote[]> {
  const res = await axios.get(`${BASE_URL}/quotes/category/${category}`);
  return res.data.quotes;
}