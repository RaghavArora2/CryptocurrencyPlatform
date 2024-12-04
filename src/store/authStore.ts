import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types/auth';

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const user = {
            id: '1',
            email,
            username: email.split('@')[0],
            balance: { usd: 10000, btc: 0.5, eth: 2 },
            bio: 'Crypto enthusiast and trader',
            avatar: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131'
          };
          const token = 'dummy-token';
          
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      register: async (email: string, password: string, username: string) => {
        try {
          const user = {
            id: '1',
            email,
            username,
            balance: { usd: 10000, btc: 0, eth: 0 },
            bio: '',
            avatar: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131'
          };
          const token = 'dummy-token';
          
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      updateBalance: (type: 'buy' | 'sell', amount: number, price: number, crypto: 'btc' | 'eth' | 'usd') => {
        const user = get().user;
        if (!user) return;

        const newBalance = { ...user.balance };

        if (crypto === 'usd') {
          if (type === 'buy') {
            newBalance.usd += amount;
          } else {
            if (newBalance.usd < amount) {
              throw new Error('Insufficient USD balance');
            }
            newBalance.usd -= amount;
          }
        } else {
          const totalCost = amount * price;
          
          if (type === 'buy') {
            if (newBalance.usd < totalCost) {
              throw new Error('Insufficient USD balance');
            }
            newBalance.usd -= totalCost;
            newBalance[crypto] += amount;
          } else {
            if (newBalance[crypto] < amount) {
              throw new Error(`Insufficient ${crypto.toUpperCase()} balance`);
            }
            newBalance.usd += totalCost;
            newBalance[crypto] -= amount;
          }
        }

        set({ user: { ...user, balance: newBalance } });
      },

      updateProfile: (data: Partial<User>) => {
        const user = get().user;
        if (!user) return;
        
        set({ user: { ...user, ...data } });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useAuthStore;