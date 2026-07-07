import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Polyline, Rect } from 'react-native-svg';
import { Colors, Spacing, FontSize, FontWeight } from '../../../theme/colors';
import { useAuthStore } from '../store/authStore';

function CopyIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={9} y={9} width={11} height={11} rx={2.5} stroke={color} strokeWidth={1.8} />
      <Path
        d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="4.5 12.5 9.5 17.5 19.5 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Shown once after a parole officer registers: presents their invite code
 * (also stored in user_metadata and parole_officers, so it's never lost)
 * with a tap-to-copy affordance before continuing to the dashboard.
 */
export default function OfficerInviteScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const session = useAuthStore((s) => s.session);
  const inviteCode = code ?? (session?.user.user_metadata?.invite_code as string | undefined) ?? '';

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); }, []);

  const handleCopy = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.contentArea}>
        <View style={styles.greenDot} />
        <Text style={styles.eyebrow}>ACCOUNT CREATED</Text>
        <Text style={styles.title}>Your invite code</Text>
        <Text style={styles.body}>
          Patients enter this code when they sign up to link to your account. You can copy and
          share it at any time.
        </Text>

        <TouchableOpacity style={styles.codeCard} onPress={handleCopy} activeOpacity={0.7}>
          <Text style={styles.codeText}>{inviteCode || '—'}</Text>
          <View style={styles.copyButton}>
            {copied ? <CheckIcon color={Colors.green} /> : <CopyIcon color={Colors.textSecondary} />}
          </View>
        </TouchableOpacity>
        <Text style={[styles.copiedHint, !copied && styles.copiedHintHidden]}>
          Copied to clipboard
        </Text>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.replace('/(app)')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continue to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screen,
  },

  contentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.huge,
    alignItems: 'flex-start',
  },
  greenDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.green,
    marginBottom: 26,
  },
  eyebrow: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.4,
    color: '#A0A0A6',
  },
  title: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
    marginTop: 16,
    lineHeight: FontSize.heading1 * 1.1,
  },
  body: {
    fontSize: FontSize.xxl,
    color: Colors.textSecondary,
    lineHeight: 28,
    marginTop: 16,
  },

  codeCard: {
    marginTop: 32,
    alignSelf: 'stretch',
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.sm,
  },
  codeText: {
    flex: 1,
    fontSize: FontSize.heading2,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: 2,
  },
  copyButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedHint: {
    fontSize: FontSize.sm,
    color: Colors.green,
    fontWeight: FontWeight.medium,
    marginTop: 10,
    marginLeft: 4,
  },
  copiedHintHidden: {
    opacity: 0,
  },

  bottomArea: {
    paddingBottom: Spacing.huge,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
});
