import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';

// ── Mock data ─────────────────────────────────────────────────────────────────

interface AssignedIndividual {
  id: string;
  name: string;
  status: 'normal' | 'elevated' | 'critical' | 'offline';
  lastSeen: string;
  deviceConnected: boolean;
  location?: string;
}

const MOCK_INDIVIDUALS: AssignedIndividual[] = [
  {
    id: '1',
    name: 'Jordan M.',
    status: 'normal',
    lastSeen: '2 min ago',
    deviceConnected: true,
    location: 'Home',
  },
  {
    id: '2',
    name: 'Casey R.',
    status: 'elevated',
    lastSeen: '4 min ago',
    deviceConnected: true,
    location: 'Unknown',
  },
  {
    id: '3',
    name: 'Taylor K.',
    status: 'normal',
    lastSeen: '1 min ago',
    deviceConnected: true,
    location: 'Work',
  },
  {
    id: '4',
    name: 'Morgan S.',
    status: 'offline',
    lastSeen: '3 hrs ago',
    deviceConnected: false,
    location: undefined,
  },
  {
    id: '5',
    name: 'Riley D.',
    status: 'normal',
    lastSeen: 'Just now',
    deviceConnected: true,
    location: 'Home',
  },
];

// ── Status helpers ────────────────────────────────────────────────────────────

function statusDotColor(status: AssignedIndividual['status']): string {
  switch (status) {
    case 'normal':
      return Colors.green;
    case 'elevated':
      return Colors.amber;
    case 'critical':
      return Colors.red;
    case 'offline':
      return Colors.textDisabled;
  }
}

function statusLabel(status: AssignedIndividual['status']): string {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'elevated':
      return 'Elevated';
    case 'critical':
      return 'Critical';
    case 'offline':
      return 'Offline';
  }
}

function statusTextColor(status: AssignedIndividual['status']): string {
  switch (status) {
    case 'normal':
      return Colors.greenDark;
    case 'elevated':
      return Colors.amberDark;
    case 'critical':
      return Colors.redDark;
    case 'offline':
      return Colors.textMuted;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface IndividualCardProps {
  individual: AssignedIndividual;
}

function IndividualCard({ individual }: IndividualCardProps) {
  const dot = statusDotColor(individual.status);
  const label = statusLabel(individual.status);
  const textColor = statusTextColor(individual.status);

  return (
    <View style={styles.card}>
      {/* Avatar initial */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{individual.name.charAt(0)}</Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{individual.name}</Text>
        <Text style={styles.cardMeta}>
          {individual.deviceConnected
            ? individual.location
              ? `${individual.location} · ${individual.lastSeen}`
              : individual.lastSeen
            : 'Device disconnected'}
        </Text>
      </View>

      {/* Status badge */}
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: dot }]} />
        <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ParoleOfficerDashboard() {
  const normalCount = MOCK_INDIVIDUALS.filter((i) => i.status === 'normal').length;
  const elevatedCount = MOCK_INDIVIDUALS.filter((i) => i.status === 'elevated').length;
  const criticalCount = MOCK_INDIVIDUALS.filter((i) => i.status === 'critical').length;
  const offlineCount = MOCK_INDIVIDUALS.filter((i) => i.status === 'offline').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Parole Officer Portal</Text>
          <Text style={styles.subheading}>Assigned individuals · live view</Text>
        </View>

        {/* Coming soon banner */}
        <View style={styles.comingSoonBanner}>
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonBody}>
            Full case management, report exports, and direct messaging are in development. The list below shows a preview with mock data.
          </Text>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: Colors.green }]}>{normalCount}</Text>
            <Text style={styles.summaryLabel}>Normal</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: Colors.amber }]}>{elevatedCount}</Text>
            <Text style={styles.summaryLabel}>Elevated</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: Colors.red }]}>{criticalCount}</Text>
            <Text style={styles.summaryLabel}>Critical</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: Colors.textMuted }]}>{offlineCount}</Text>
            <Text style={styles.summaryLabel}>Offline</Text>
          </View>
        </View>

        {/* Section header */}
        <Text style={styles.sectionLabel}>ASSIGNED INDIVIDUALS</Text>

        {/* Individual cards */}
        <View style={styles.cardList}>
          {MOCK_INDIVIDUALS.map((individual) => (
            <IndividualCard key={individual.id} individual={individual} />
          ))}
        </View>

        <Text style={styles.footerNote}>
          Mock data only — live data sync coming in a future release.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 150,
  },

  // Header
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  heading: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  subheading: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginTop: 4,
  },

  // Coming soon banner
  comingSoonBanner: {
    backgroundColor: Colors.amberTint,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.amberBadgeTint,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
  },
  comingSoonTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.amberDark,
    marginBottom: 4,
  },
  comingSoonBody: {
    fontSize: FontSize.sm,
    color: Colors.amberDark,
    lineHeight: 19,
    opacity: 0.85,
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    paddingVertical: Spacing.base,
    marginBottom: Spacing.xl,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: FontSize.heading2,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.4,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: FontWeight.medium,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },

  // Section
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },

  // Card list
  cardList: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  // Card info
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
  cardMeta: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // Footer
  footerNote: {
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
