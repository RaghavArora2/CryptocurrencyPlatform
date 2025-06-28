import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { wsService } from '../services/websocket';

interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  avatar?: string;
  is_verified?: boolean;
  two_factor_enabled?: boolean;
}

interface Wallet {
  currency: string;
  balance: number;
  locked_balance: number;
}

interface AuthState {
  user: User | null;
  wallets: Wallet[];
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  fetchWallets: () => Promise<void>;
  deposit: (currency: string, amount: number) => Promise<void>;
  withdraw: (currency: string, amount: number) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      wallets: [],
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('auth-token', token);
          set({ user, token, isAuthenticated: true });
          
          // Connect WebSocket
          wsService.connect(token);
          
          // Fetch wallets
          await get().fetchWallets();
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Login failed');
        } finally {
          set({ loading: false });
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ loading: true });
        try {
          const response = await api.post('/auth/register', { email, password, username });
          const { token, user } = response.data;
          
          localStorage.setItem('auth-token', token);
          set({ user, token, isAuthenticated: true });
          
          // Connect WebSocket
          wsService.connect(token);
          
          // Fetch wallets
          await get().fetchWallets();
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Registration failed');
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        wsService.disconnect();
        set({ user: null, wallets: [], token: null, isAuthenticated: false });
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          await api.put('/user/profile', data);
          set(state => ({ user: state.user ? { ...state.user, ...data } : null }));
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Profile update failed');
        }
      },

      fetchWallets: async () => {
        try {
          const response = await api.get('/user/wallets');
          set({ wallets: response.data });
        } catch (error) {
          console.error('Failed to fetch wallets:', error);
        }
      },

      deposit: async (currency: string, amount: number) => {
        try {
          await api.post('/user/deposit', { currency, amount });
          await get().fetchWallets();
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Deposit failed');
        }
      },

      withdraw: async (currency: string, amount: number) => {
        try {
          await api.post('/user/withdraw', { currency, amount });
          await get().fetchWallets();
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Withdrawal failed');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export default useAuthStore;