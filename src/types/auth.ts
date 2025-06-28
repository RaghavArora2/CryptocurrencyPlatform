export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  is_verified?: boolean;
  two_factor_enabled?: boolean;
}

export interface Wallet {
  currency: string;
  balance: number;
  locked_balance: number;
}

export interface AuthState {
  user: User | null;
  wallets: Wallet[];
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, username: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  fetchWallets: () => Promise<void>;
  deposit: (currency: string, amount: number) => Promise<void>;
  withdraw: (currency: string, amount: number) => Promise<void>;
}