import axios from 'axios';

export const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const apiClient = axios.create({
  baseURL: COINGECKO_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});