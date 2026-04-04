import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  needsOnboarding: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      token: 'placeholder-token',
      user: { id: '1', email },
      isAuthenticated: true,
      needsOnboarding: false,
      isLoading: false,
    });
  },

  register: async (email: string, _password: string, name?: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      token: 'placeholder-token',
      user: { id: '1', email, name },
      isAuthenticated: true,
      needsOnboarding: true,
      isLoading: false,
    });
  },

  completeOnboarding: () => {
    set({ needsOnboarding: false });
  },

  logout: () => {
    set({ token: null, user: null, isAuthenticated: false, needsOnboarding: false });
  },
}));
