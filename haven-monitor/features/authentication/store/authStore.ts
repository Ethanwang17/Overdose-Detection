import { create } from 'zustand';
import type { UserProfile, UserRole } from '../../../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOnboardingComplete: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
  logout: () => set({ user: null, isAuthenticated: false, hasCompletedOnboarding: false }),
}));
