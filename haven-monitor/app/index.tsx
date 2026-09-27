import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../features/authentication/store/authStore';

export default function Index() {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#15151A" />
      </View>
    );
  }

  // Onboarding happens after sign-in, inside the patient shell — officers
  // never see it.
  if (session) return <Redirect href="/(app)" />;
  return <Redirect href="/(auth)/login" />;
}
