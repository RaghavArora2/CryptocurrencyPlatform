export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  balance: {
    usd: number;
    btc: number;
    eth: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, username: string) => Promise<void>;
  updateBalance: (type: 'buy' | 'sell', amount: number, price: number, crypto: 'btc' | 'eth') => void;
  updateProfile: (data: Partial<User>) => void;
}