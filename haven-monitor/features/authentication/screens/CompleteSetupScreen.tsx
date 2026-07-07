import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '../../../theme/colors';
import { AuthService } from '../../../services/AuthService';
import { useAuthStore } from '../store/authStore';

/**
 * Shown when a signed-in user has no profile row — i.e. registration was
 * interrupted (typically by email confirmation) and ensureProfile failed.
 * Lets the user retry profile creation or sign out, instead of a dead end.
 */
export default function CompleteSetupScreen() {
  const { session, error, setProfile, setError } = useAuthStore();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!session) return;
    setIsRetrying(true);
    try {
      const profile = await AuthService.ensureProfile(session.user);
      setProfile(profile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not finish setting up your account.');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.greenDot} />
          <Text style={styles.brandName}>Haven</Text>
        </View>

        <View style={styles.spacerLg} />

        <Text style={styles.heading}>Finish account setup</Text>
        <Text style={styles.subtitle}>
          {error ?? 'Your account was created, but its setup never finished.'}
        </Text>

        <View style={styles.spacerMd} />

        <TouchableOpacity
          style={[styles.ctaButton, isRetrying && styles.ctaButtonLoading]}
          onPress={handleRetry}
          activeOpacity={0.85}
          disabled={isRetrying}
        >
          <Text style={styles.ctaText}>{isRetrying ? 'Retrying…' : 'Try Again'}</Text>
        </TouchableOpacity>

        <View style={styles.spacerSm} />

        <TouchableOpacity onPress={() => AuthService.signOut()} activeOpacity={0.6}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.screen },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green },
  brandName: { fontSize: FontSize.heading1, fontWeight: FontWeight.bold, color: Colors.ink, letterSpacing: -0.6 },
  spacerLg: { height: 40 },
  spacerMd: { height: 32 },
  spacerSm: { height: 16 },
  heading: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: 8 },
  ctaButton: { height: 56, borderRadius: 16, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
  ctaButtonLoading: { opacity: 0.7 },
  ctaText: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.white },
  signOutText: { fontSize: FontSize.lg, color: Colors.textTertiary, textAlign: 'center' },
});
