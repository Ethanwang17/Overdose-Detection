import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../features/authentication/store/authStore';

export default function AuthLayout() {
  const { session, isLoading } = useAuthStore();

  if (!isLoading && session) return <Redirect href="/(app)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
