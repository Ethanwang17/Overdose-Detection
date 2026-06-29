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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendReset = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Check your inbox');
      setTimeout(() => {
        router.back();
      }, 2000);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.container}>
          {/* Brand mark */}
          <View style={styles.brandRow}>
            <View style={styles.greenDot} />
            <Text style={styles.brandName}>Haven</Text>
          </View>

          <View style={styles.spacerLg} />

          {/* Heading */}
          <Text style={styles.heading}>Reset password</Text>
          <Text style={styles.subtitle}>We'll send a reset link to your email.</Text>

          <View style={styles.spacerMd} />

          {/* Email input */}
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

          <View style={styles.spacerMd} />

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaButton, isLoading && styles.ctaButtonLoading]}
            onPress={handleSendReset}
            activeOpacity={0.85}
            disabled={isLoading || !!successMessage}
          >
            <Text style={styles.ctaText}>
              {isLoading ? 'Sending…' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          {/* Success message */}
          {!!successMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}
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

  /* Back button */
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  backArrow: {
    fontSize: FontSize.xxl,
    color: Colors.ink,
    lineHeight: 24,
  },

  /* Main content */
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -60,
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

  /* Input */
  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: Spacing.base,
    fontSize: FontSize.xl,
    color: Colors.ink,
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

  /* Success */
  successContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: FontSize.lg,
    color: Colors.green,
    fontWeight: FontWeight.medium,
  },
});
