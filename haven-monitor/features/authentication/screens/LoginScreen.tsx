import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(app)');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Brand mark */}
          <View style={styles.brandRow}>
            <View style={styles.greenDot} />
            <Text style={styles.brandName}>Haven</Text>
          </View>

          <View style={styles.spacerLg} />

          {/* Heading */}
          <Text style={styles.heading}>Sign in</Text>
          <Text style={styles.subtitle}>Continue monitoring your health.</Text>

          <View style={styles.spacerMd} />

          {/* Inputs */}
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
            autoComplete="password"
          />

          <View style={styles.spacerMd} />

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.ctaButtonLoading]}
            onPress={handleSignIn}
            activeOpacity={0.85}
            disabled={isLoading}
          >
            <Text style={styles.ctaText}>{isLoading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.spacerSm} />

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            activeOpacity={0.6}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Register link at bottom */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
            <Text style={styles.registerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },

  /* Brand */
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  brandName: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
  },

  /* Spacers */
  spacerLg: {
    height: 40,
  },
  spacerMd: {
    height: 32,
  },
  spacerSm: {
    height: 16,
  },

  /* Heading */
  heading: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: 8,
  },

  /* Inputs */
  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: Spacing.base,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  inputGap: {
    height: 10,
  },

  /* CTA */
  ctaButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonLoading: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },

  /* Forgot */
  forgotText: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  /* Register row */
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.huge,
  },
  registerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
});
