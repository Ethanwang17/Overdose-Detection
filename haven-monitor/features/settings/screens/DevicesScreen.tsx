import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';
import type { WearableDevice } from '../../../types';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DEVICE: WearableDevice = {
  id: 'aw-series9',
  name: 'Apple Watch Series 9',
  type: 'apple_watch',
  connectionStatus: 'connected',
  batteryLevel: 87,
  lastSync: new Date(),
};

// ── Battery Bar ──────────────────────────────────────────────────────────────

interface BatteryBarProps {
  level: number;
}

const BatteryBar: React.FC<BatteryBarProps> = ({ level }) => {
  const barColor =
    level > 50 ? Colors.green : level > 20 ? Colors.amber : Colors.red;

  return (
    <View style={styles.batteryContainer}>
      <View style={styles.batteryOuter}>
        <View
          style={[
            styles.batteryFill,
            { width: `${level}%` as any, backgroundColor: barColor },
          ]}
        />
      </View>
      <View style={styles.batteryTip} />
    </View>
  );
};

// ── Device Card ──────────────────────────────────────────────────────────────

interface DeviceCardProps {
  device: WearableDevice;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const isConnected = device.connectionStatus === 'connected';
  const statusColor = isConnected ? Colors.green : Colors.textTertiary;
  const statusLabel = isConnected ? 'Connected' : 'Disconnected';

  return (
    <View style={styles.deviceCard}>
      {/* Watch Icon */}
      <View style={styles.watchIconContainer}>
        <Text style={styles.watchEmoji}>⌚</Text>
      </View>

      {/* Device Info */}
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{device.name}</Text>

        {/* Status Row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ── Stats Row ─────────────────────────────────────────────────────────────────

interface StatItemProps {
  label: string;
  value: string;
  accent?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, accent }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, accent && { color: Colors.green }]}>
      {value}
    </Text>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function DevicesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
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
        <Text style={styles.pageTitle}>Devices</Text>
        <Text style={styles.pageSubtitle}>
          Manage the wearable devices used to monitor your biometrics.
        </Text>

        {/* Device Card */}
        <DeviceCard device={MOCK_DEVICE} />

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatItem
              label="Battery"
              value={`${MOCK_DEVICE.batteryLevel}%`}
              accent
            />
            <View style={styles.statDivider} />
            <StatItem
              label="Last Sync"
              value="Just now"
            />
          </View>

          {/* Battery Bar */}
          <View style={styles.batterySection}>
            <View style={styles.batteryLabelRow}>
              <Text style={styles.batteryLabel}>Battery Level</Text>
              <Text style={styles.batteryPercent}>
                {MOCK_DEVICE.batteryLevel}%
              </Text>
            </View>
            <BatteryBar level={MOCK_DEVICE.batteryLevel} />
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.6}
            onPress={() => {}}
          >
            <Text style={styles.actionLabel}>Sync Now</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.6}
            onPress={() => {}}
          >
            <Text style={styles.actionLabel}>Rename Device</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.6}
            onPress={() => {}}
          >
            <Text style={[styles.actionLabel, { color: Colors.red }]}>
              Remove Device
            </Text>
            <Text style={[styles.actionChevron, { color: Colors.red }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Add Device Button */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Text style={styles.addButtonText}>+ Add Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },

  // Header
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

  // Scroll
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 120,
    gap: Spacing.md,
  },

  // Title
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

  // Device Card
  deviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  watchIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.bgGray,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  watchEmoji: {
    fontSize: 26,
  },
  deviceInfo: {
    flex: 1,
    gap: 6,
  },
  deviceName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // Stats Card
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    padding: Spacing.base,
    gap: Spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
  },

  // Battery
  batterySection: {
    gap: 8,
  },
  batteryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  batteryPercent: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  batteryOuter: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.bgGray,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryTip: {
    width: 3,
    height: 5,
    borderRadius: 1,
    backgroundColor: Colors.textDisabled,
  },

  // Actions Card
  actionsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    overflow: 'hidden',
  },
  actionRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  actionLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    color: Colors.ink,
  },
  actionChevron: {
    fontSize: 20,
    color: Colors.chevron,
    lineHeight: 22,
    marginTop: -1,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },

  // Add Button
  addButton: {
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: Spacing.xs,
  },
  addButtonText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },
});
