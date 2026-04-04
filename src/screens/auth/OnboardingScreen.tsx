import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const SPARKBAR_DATA = [30, 45, 38, 55, 48, 60, 52, 65, 70, 62, 68, 72];

function SparkBars() {
  const max = Math.max(...SPARKBAR_DATA);
  return (
    <View style={spark.container}>
      {SPARKBAR_DATA.map((val, i) => (
        <View
          key={i}
          style={[
            spark.bar,
            {
              height: Math.max(4, (val / max) * 48),
              backgroundColor: i >= SPARKBAR_DATA.length - 3
                ? colors.secondary
                : colors.outlineVariant,
            },
          ]}
        />
      ))}
    </View>
  );
}

const spark = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 52,
    gap: 4,
    marginTop: 12,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
  },
});

export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="bluetooth" size={20} color={colors.primary} />
        <Text style={styles.headerLabel}>PRECISION MONITORING</Text>
        <TouchableOpacity onPress={completeOnboarding} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase label */}
        <Text style={styles.phaseLabel}>Phase 01 / Setup</Text>

        {/* Headline */}
        <Text style={styles.headline}>Bio-Sync{'\n'}Calibration</Text>

        <Text style={styles.description}>
          Connect your Fitbit device and allow 24 hours for the system to establish your personal biometric baseline.
        </Text>

        {/* Connect Fitbit card */}
        <View style={styles.connectCard}>
          <View style={styles.connectIconRow}>
            <View style={styles.watchIconWrap}>
              <Ionicons name="watch-outline" size={32} color={colors.primary} />
            </View>
            <View style={styles.connectTextWrap}>
              <Text style={styles.connectTitle}>Fitbit Integration</Text>
              <Text style={styles.connectSubtitle}>Ready to pair your device</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.9} style={styles.connectButton}>
            <Text style={styles.connectButtonText}>CONNECT FITBIT</Text>
            <Ionicons name="link-outline" size={16} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressValue}>04</Text>
              <View style={styles.progressDivider} />
              <Text style={styles.progressMax}>24H</Text>
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Baseline Progress</Text>
              <Text style={styles.progressSubtext}>Establishing biometric baseline</Text>
            </View>
          </View>
          <SparkBars />
        </View>

        {/* Instruction cards */}
        <View style={styles.instructionRow}>
          <View style={[styles.instructionCard, { borderLeftColor: colors.secondary }]}>
            <Text style={styles.instructionTitle}>Latency</Text>
            <Text style={styles.instructionText}>
              Real-time sync every 15 seconds with 99.9% uptime
            </Text>
          </View>
          <View style={[styles.instructionCard, { borderLeftColor: colors.primary }]}>
            <Text style={styles.instructionTitle}>Security</Text>
            <Text style={styles.instructionText}>
              AES-256 encrypted data transmission to Firebase
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.footerGradient}
        >
          <View style={styles.footerContent}>
            <Text style={styles.footerStatus}>System ready for calibration</Text>
            <TouchableOpacity onPress={completeOnboarding}>
              <Text style={styles.footerSkip}>Skip for now →</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  headerLabel: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    letterSpacing: 1.5,
    flex: 1,
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
  },
  skipText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  phaseLabel: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 12,
    color: colors.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  headline: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 40,
    color: colors.onSurface,
    lineHeight: 46,
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  description: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 24,
  },
  connectCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  connectIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  watchIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.infoContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectTextWrap: { flex: 1 },
  connectTitle: {
    fontFamily: fonts.manrope.bold,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 2,
  },
  connectSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.onSurface,
    paddingVertical: 13,
    borderRadius: 10,
  },
  connectButtonText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 13,
    color: colors.onPrimary,
    letterSpacing: 1,
  },
  progressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressValue: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 32,
    color: colors.onSurface,
    lineHeight: 36,
  },
  progressDivider: {
    height: 2,
    width: 28,
    backgroundColor: colors.outlineVariant,
    marginVertical: 4,
  },
  progressMax: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  progressInfo: { flex: 1 },
  progressLabel: {
    fontFamily: fonts.manrope.bold,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 4,
  },
  progressSubtext: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  instructionCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  instructionTitle: {
    fontFamily: fonts.manrope.bold,
    fontSize: 13,
    color: colors.onSurface,
    marginBottom: 4,
  },
  instructionText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  footer: {
    overflow: 'hidden',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  footerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStatus: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  footerSkip: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 13,
    color: colors.onPrimary,
  },
});
