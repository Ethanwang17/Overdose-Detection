import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight } from '../../../theme/colors';
import { AuthService } from '../../../services/AuthService';

type Role = 'patient' | 'officer';

export default function RegisterScreen() {
  const [role, setRole] = useState<Role>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isOfficer = role === 'officer';
  const codePlaceholder = isOfficer ? 'Admin code' : 'Officer invite code';
  const codeHint = isOfficer
    ? 'Provided by your Haven administrator'
    : 'Provided by your parole officer';

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !code.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (isOfficer) {
        const result = await AuthService.registerOfficer(email.trim(), password, name.trim(), code.trim());
        if (result.needsEmailConfirmation) {
          Alert.alert(
            'Confirm your email',
            `We sent a confirmation link to ${email.trim()}. Open it, then sign in.\n\nYour officer invite code is:\n\n${result.inviteCode}\n\nShare this with your patients once you're signed in.`,
            [{ text: 'Go to Sign In', onPress: () => router.replace('/(auth)/login') }]
          );
        } else {
          router.replace({ pathname: '/officer-invite', params: { code: result.inviteCode } });
        }
      } else {
        const result = await AuthService.registerPatient(email.trim(), password, name.trim(), code.trim());
        if (result.needsEmailConfirmation) {
          Alert.alert(
            'Confirm your email',
            `We sent a confirmation link to ${email.trim()}. Open it, then sign in to finish setting up your account.`,
            [{ text: 'Go to Sign In', onPress: () => router.replace('/(auth)/login') }]
          );
        } else {
          router.replace('/onboarding');
        }
      }
    } catch (err: any) {
      Alert.alert('Registration failed', err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.greenDot} />
            <Text style={styles.brandName}>Haven</Text>
          </View>

          <View style={styles.spacerLg} />

          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subtitle}>Start your protection today.</Text>

          <View style={styles.spacerMd} />

          {/* Role toggle */}
          <View style={styles.roleToggle}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
              onPress={() => setRole('patient')}
              activeOpacity={0.75}
            >
              <Text style={[styles.roleButtonText, role === 'patient' && styles.roleButtonTextActive]}>
                Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'officer' && styles.roleButtonActive]}
              onPress={() => setRole('officer')}
              activeOpacity={0.75}
            >
              <Text style={[styles.roleButtonText, role === 'officer' && styles.roleButtonTextActive]}>
                Parole Officer
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacerMd} />

          {/* Fields */}
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
            autoComplete="name"
          />
          <View style={styles.inputGap} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <View style={styles.inputGap} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={Colors.textTertiary}
            secureTextEntry
            autoComplete="new-password"
          />
          <View style={styles.inputGap} />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={Colors.textTertiary}
            secureTextEntry
            autoComplete="new-password"
          />
          <View style={styles.inputGap} />

          {/* Code field */}
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={code}
            onChangeText={setCode}
            placeholder={codePlaceholder}
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Text style={styles.codeHint}>{codeHint}</Text>

          <View style={styles.spacerMd} />

          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.ctaButtonLoading]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <Text style={styles.ctaText}>{isLoading ? 'Creating account…' : 'Get Started'}</Text>
          </TouchableOpacity>

          <View style={styles.spacerXl} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.huge,
    justifyContent: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green },
  brandName: { fontSize: FontSize.heading1, fontWeight: FontWeight.bold, color: Colors.ink, letterSpacing: -0.6 },
  spacerLg: { height: 40 },
  spacerMd: { height: 32 },
  spacerXl: { height: 24 },
  heading: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: 8 },

  // Role toggle
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 14,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonText: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textTertiary },
  roleButtonTextActive: { color: Colors.ink, fontWeight: FontWeight.semibold },

  // Inputs
  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: Spacing.base,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  codeInput: {
    letterSpacing: 1,
  },
  inputGap: { height: 10 },
  codeHint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 6,
    marginLeft: 4,
  },

  // CTA
  ctaButton: { height: 56, borderRadius: 16, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
  ctaButtonLoading: { opacity: 0.7 },
  ctaText: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.white },

  // Sign in link
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: FontSize.md, color: Colors.textSecondary },
  loginLink: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.ink },
});
