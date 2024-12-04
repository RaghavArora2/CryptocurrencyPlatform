export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
}

export interface Trade {
  price: number;
  amount: number;
  type: 'buy' | 'sell';
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}