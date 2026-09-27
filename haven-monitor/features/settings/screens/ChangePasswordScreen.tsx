import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight } from '../../../theme';
import { AuthService } from '../../../services/AuthService';

/**
 * In-app password change for a signed-in user. Unlike the "Forgot
 * password" email, this needs no redirect link, so it works on a phone
 * without any deep-link setup.
 */
export default function ChangePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await AuthService.changePassword(password);
      Alert.alert('Password changed', 'Use your new password next time you sign in.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Could not change password', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.pageTitle}>Change password</Text>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry
          autoComplete="new-password"
        />
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm new password"
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry
          autoComplete="new-password"
        />

        <TouchableOpacity
          style={[styles.ctaButton, saving && styles.ctaButtonBusy]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Save Password'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backChevron: { fontSize: 26, color: Colors.green, lineHeight: 30, marginTop: -2 },
  backLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.medium, color: Colors.green },
  body: { flex: 1, paddingHorizontal: Spacing.screen, gap: 10 },
  pageTitle: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
    marginBottom: Spacing.md,
  },
  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: Spacing.base,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  ctaButtonBusy: { opacity: 0.7 },
  ctaText: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.white },
});
