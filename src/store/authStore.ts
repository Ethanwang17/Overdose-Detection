import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    // TODO: Replace with real API call via src/api/client.ts
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      token: 'placeholder-token',
      user: { id: '1', email },
      isAuthenticated: true,
      isLoading: false,
    });
    // To add persistence later, wrap create() with persist() middleware
    // and provide @react-native-async-storage/async-storage as the storage engine
  },

  register: async (email: string, _password: string) => {
    set({ isLoading: true });
    // TODO: Replace with real API call via src/api/client.ts
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      token: 'placeholder-token',
      user: { id: '1', email },
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
