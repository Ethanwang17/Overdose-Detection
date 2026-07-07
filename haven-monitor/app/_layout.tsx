import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { AuthService } from '../services/AuthService';
import { EmergencyContactService } from '../services/EmergencyContactService';
import { useAuthStore } from '../features/authentication/store/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

export default function RootLayout() {
  const { setSession, setProfile, setLoading, setError, clear } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    // ensureProfile also creates the profile/parole_officers rows for
    // accounts whose registration was interrupted by email confirmation.
    const loadProfile = async (session: Session) => {
      try {
        const profile = await AuthService.ensureProfile(session.user);
        setProfile(profile);
        setError(null);
        // Save any emergency contact picked during pre-sign-in onboarding.
        EmergencyContactService.flushPending(session.user.id).catch(() => {});
      } catch (err) {
        // Session exists but no usable profile — AppShell shows the
        // finish-setup screen with this message.
        setProfile(null);
        setError(err instanceof Error ? err.message : 'Could not load your profile.');
      }
    };

    AuthService.getSession().then(async (session) => {
      setSession(session);
      if (session) await loadProfile(session);
      setLoading(false);
    });

    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        await loadProfile(session);
      } else {
        clear();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
