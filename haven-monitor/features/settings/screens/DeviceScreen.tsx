import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';
import { HealthService } from '../../../services/HealthService';
import { useAuthStore } from '../../authentication/store/authStore';
import { useReadinessStore } from '../../onboarding/store/readinessStore';
import { WATCH_STALE_MINUTES } from '../../../constants';

function ago(date: Date | null): string {
  if (!date) return '';
  const mins = Math.round((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hr${hours === 1 ? '' : 's'} ago`;
}

/**
 * Patient only. Haven can't pair watches — iOS does that — so this screen
 * re-authorizes Apple Health and re-checks that the paired watch is
 * delivering data. There's deliberately no "add a device".
 */
export default function DeviceScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const watch = useReadinessStore((s) => s.result?.watch);
  const refresh = useReadinessStore((s) => s.refresh);
  const [checking, setChecking] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  if (profile && profile.role !== 'patient') return <Redirect href="/(app)" />;

  const handleReconnect = async () => {
    if (!profile) return;
    setChecking(true);
    try {
      await HealthService.requestPermissions();
      await refresh(profile.id, profile);
    } finally {
      setChecking(false);
      setCheckedOnce(true);
    }
  };

  const connected = watch?.state === 'connected';
  let title = 'Checking…';
  let detail = '';
  if (watch?.state === 'connected') {
    title = watch.sourceName ?? 'Apple Watch';
    detail = `Connected · last reading ${ago(watch.lastSampleAt)}${watch.manual ? ' (manual entry, dev build)' : ''}`;
  } else if (watch?.state === 'stale') {
    title = 'Not reporting';
    detail = `Last reading ${ago(watch.lastSampleAt)}. Haven needs a reading at least every ${WATCH_STALE_MINUTES} minutes.`;
  } else if (watch?.state === 'no_data') {
    title = 'No data yet';
    detail = 'Haven hasn\'t received heart-rate data from a watch.';
  } else if (watch?.state === 'unavailable') {
    title = 'Apple Health unavailable';
    detail = 'This build or device can\'t read Apple Health data.';
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Apple Watch</Text>
        <Text style={styles.pageSubtitle}>
          Haven reads your vitals from the Apple Watch paired with this iPhone. Your parole
          officer can see which watch is reporting.
        </Text>

        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: connected ? Colors.green : Colors.amber }]} />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>{title}</Text>
            {!!detail && <Text style={styles.statusDetail}>{detail}</Text>}
          </View>
        </View>

        {!connected && (
          <View style={styles.tips}>
            <Text style={styles.tip}>1. Wear your watch and make sure it's unlocked.</Text>
            <Text style={styles.tip}>2. Check Settings › Health › Data Access & Devices › Haven Monitor — all categories on.</Text>
            <Text style={styles.tip}>3. Open the Heart Rate app on your watch to take a reading, then tap Reconnect.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.reconnectButton, checking && styles.reconnectButtonBusy]}
          activeOpacity={0.8}
          onPress={handleReconnect}
          disabled={checking}
        >
          <Text style={styles.reconnectText}>{checking ? 'Checking…' : 'Reconnect'}</Text>
        </TouchableOpacity>
        {checkedOnce && !checking && !connected && (
          <Text style={styles.retryHint}>Still no recent data. Follow the steps above, then try again.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backChevron: {
    fontSize: 26,
    color: Colors.green,
    lineHeight: 30,
    marginTop: -2,
  },
  backLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.green,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  pageTitle: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    padding: Spacing.base,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
  statusDetail: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  tips: {
    gap: 8,
    paddingHorizontal: 4,
  },
  tip: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reconnectButton: {
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  reconnectButtonBusy: {
    opacity: 0.7,
  },
  reconnectText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  retryHint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
