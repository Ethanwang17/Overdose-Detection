import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type EventSeverity = 'critical' | 'warning' | 'stable' | 'info';

interface AlertEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  severity: EventSeverity;
  icon: keyof typeof Ionicons.glyphMap;
}

const ALL_EVENTS: AlertEvent[] = [
  {
    id: '1',
    title: 'SpO2 Drop Detected',
    description: 'Blood oxygen fell to 88% — below threshold of 92%. Alert dispatched.',
    time: '12:45 PM',
    severity: 'critical',
    icon: 'warning-outline',
  },
  {
    id: '2',
    title: 'Possible Narcosis Event',
    description: 'Heart rate variability and respiratory pattern suggest possible CNS depression.',
    time: '11:20 AM',
    severity: 'warning',
    icon: 'alert-circle-outline',
  },
  {
    id: '3',
    title: 'Normal Baseline Confirmed',
    description: 'All vitals within established personal baseline. No anomalies detected.',
    time: '09:15 AM',
    severity: 'stable',
    icon: 'checkmark-circle-outline',
  },
  {
    id: '4',
    title: 'Data Synchronization',
    description: 'Fitbit sync completed. 847 data points ingested. Baseline updated.',
    time: '08:00 AM',
    severity: 'info',
    icon: 'sync-outline',
  },
];

const severityConfig: Record<EventSeverity, { bg: string; icon: string; label: string; labelColor: string }> = {
  critical: {
    bg: colors.criticalContainer,
    icon: colors.critical,
    label: 'Critical',
    labelColor: colors.critical,
  },
  warning: {
    bg: colors.warningContainer,
    icon: colors.warning,
    label: 'Moderate',
    labelColor: colors.warning,
  },
  stable: {
    bg: colors.successContainer,
    icon: colors.success,
    label: 'Normal',
    labelColor: colors.success,
  },
  info: {
    bg: colors.infoContainer,
    icon: colors.info,
    label: 'Info',
    labelColor: colors.info,
  },
};

interface EventRowProps {
  event: AlertEvent;
}

function EventRow({ event }: EventRowProps) {
  const config = severityConfig[event.severity];
  return (
    <View style={[evtStyles.row, { backgroundColor: config.bg }]}>
      <View style={[evtStyles.iconCircle, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
        <Ionicons name={event.icon} size={20} color={config.icon} />
      </View>
      <View style={evtStyles.content}>
        <View style={evtStyles.titleRow}>
          <Text style={evtStyles.title}>{event.title}</Text>
          <View style={[evtStyles.badge, { backgroundColor: 'rgba(0,0,0,0.08)' }]}>
            <Text style={[evtStyles.badgeText, { color: config.labelColor }]}>{config.label}</Text>
          </View>
        </View>
        <Text style={evtStyles.description}>{event.description}</Text>
        <Text style={evtStyles.time}>{event.time} · Today</Text>
      </View>
    </View>
  );
}

const evtStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.manrope.bold,
    fontSize: 14,
    color: colors.onSurface,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  badgeText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  description: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
});

export default function HistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'alerts'>('all');

  const visibleEvents =
    filter === 'alerts'
      ? ALL_EVENTS.filter((e) => e.severity === 'critical' || e.severity === 'warning')
      : ALL_EVENTS;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Event History</Text>
          <Text style={styles.headerSubtitle}>Today · 4 events logged</Text>
        </View>
        <Ionicons name="bluetooth" size={18} color={colors.secondary} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              All History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('alerts')}
            style={[styles.filterTab, filter === 'alerts' && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === 'alerts' && styles.filterTabTextActive]}>
              Alerts Only
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
            </View>
            <Text style={styles.summaryLabel}>System Health</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>Optimal</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.criticalContainer }]}>
              <Ionicons name="notifications-outline" size={18} color={colors.critical} />
            </View>
            <Text style={styles.summaryLabel}>Total Events</Text>
            <Text style={[styles.summaryValue, { color: colors.onSurface }]}>4 Today</Text>
          </View>
        </View>

        {/* Date divider */}
        <View style={styles.dateDivider}>
          <View style={styles.dateDividerLine} />
          <Text style={styles.dateDividerText}>Earlier Today</Text>
          <View style={styles.dateDividerLine} />
        </View>

        {/* Events list */}
        {visibleEvents.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}

        {visibleEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>No alerts recorded today</Text>
          </View>
        )}

        {/* Export card */}
        <View style={styles.exportCard}>
          <View style={styles.exportLeft}>
            <Ionicons name="document-text-outline" size={22} color={colors.primary} />
            <View>
              <Text style={styles.exportTitle}>Export Logs</Text>
              <Text style={styles.exportSubtitle}>Generate clinical PDF report</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
            <Text style={styles.exportButtonText}>Export</Text>
            <Ionicons name="download-outline" size={14} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 22,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  filterTabTextActive: {
    fontFamily: fonts.inter.semiBold,
    color: colors.onSurface,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: fonts.manrope.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dateDividerText: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  exportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exportTitle: {
    fontFamily: fonts.manrope.bold,
    fontSize: 14,
    color: colors.onSurface,
  },
  exportSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  exportButtonText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 13,
    color: colors.onPrimary,
  },
});
