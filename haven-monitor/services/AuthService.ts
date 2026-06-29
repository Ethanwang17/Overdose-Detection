import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'haven_session';

export const AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    return data;
  },
  async signOut() {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
