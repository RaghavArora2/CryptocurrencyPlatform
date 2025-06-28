export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  type: 'long' | 'short';
  size: number;
  entry_price: number;
  current_price: number;
  leverage: number;
  margin: number;
  unrealized_pnl: number;
  realized_pnl: number;
  status: 'open' | 'closed' | 'liquidated';
  stop_loss?: number;
  take_profit?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  stop_price?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filled_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
}

export interface TradingStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  best_trade: number;
  worst_trade: number;
  avg_trade_size: number;
  total_volume: number;
  total_fees: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change_24h: number;
  change_percentage_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  market_cap: number;
  last_updated: string;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  last_updated: string;
}