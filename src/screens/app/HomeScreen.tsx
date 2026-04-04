import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MetricCard from '../../components/MetricCard';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const HR_SPARKLINE = [58, 62, 60, 65, 68, 64, 70, 72, 69, 72, 73, 72];
const SPO2_SPARKLINE = [96, 97, 97, 98, 97, 98, 98, 99, 98, 98, 98, 98];
const RESP_SPARKLINE = [12, 13, 14, 13, 14, 15, 14, 14, 13, 14, 14, 14];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bluetooth" size={16} color={colors.secondary} />
          <Text style={styles.headerTitle}>Precision Monitoring</Text>
        </View>
        <View style={styles.bluetoothBadge}>
          <View style={styles.bluetoothDot} />
          <Text style={styles.bluetoothText}>Live</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status row */}
        <View style={styles.statusCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View style={styles.statusText}>
            <Text style={styles.statusName}>Dr. Adrian Sterling</Text>
            <View style={styles.statusRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusLabel}>Status: Monitoring</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Active</Text>
          </View>
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>Live Vitals</Text>

        {/* Heart Rate — full width */}
        <MetricCard
          icon="heart-outline"
          label="Heart Rate"
          value="72"
          unit="BPM"
          badge="Stable"
          badgeVariant="stable"
          sparkline={HR_SPARKLINE}
          accent={colors.critical}
          style={styles.cardFullWidth}
        />

        {/* SpO2 + Respiration — 2 columns */}
        <View style={styles.cardRow}>
          <MetricCard
            icon="water-outline"
            label="Blood Oxygen"
            value="98"
            unit="%"
            badge="Normal"
            badgeVariant="stable"
            sparkline={SPO2_SPARKLINE}
            accent={colors.secondary}
            style={styles.cardHalf}
          />
          <MetricCard
            icon="pulse-outline"
            label="Resp. Rate"
            value="14"
            unit="rpm"
            badge="Stable"
            badgeVariant="stable"
            sparkline={RESP_SPARKLINE}
            accent={colors.primaryContainer}
            style={styles.cardHalf}
          />
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>Recovery</Text>

        {/* Sleep Recovery card */}
        <View style={styles.sleepCard}>
          <View style={styles.sleepHeader}>
            <View style={styles.sleepIconWrap}>
              <Ionicons name="moon-outline" size={20} color={colors.primaryContainer} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sleepTitle}>Sleep Recovery Analysis</Text>
              <Text style={styles.sleepSubtitle}>Last night · 7h 24m</Text>
            </View>
            <View style={styles.sleepScore}>
              <Text style={styles.sleepScoreValue}>86</Text>
              <Text style={styles.sleepScoreLabel}>score</Text>
            </View>
          </View>
          <Text style={styles.sleepDescription}>
            Deep sleep cycles within normal range. REM latency optimal. No anomalous respiratory events detected during monitoring window.
          </Text>
          <View style={styles.sleepStats}>
            <View style={styles.sleepStat}>
              <Text style={styles.sleepStatValue}>2h 14m</Text>
              <Text style={styles.sleepStatLabel}>Deep Sleep</Text>
            </View>
            <View style={styles.sleepStatDivider} />
            <View style={styles.sleepStat}>
              <Text style={styles.sleepStatValue}>1h 48m</Text>
              <Text style={styles.sleepStatLabel}>REM Sleep</Text>
            </View>
            <View style={styles.sleepStatDivider} />
            <View style={styles.sleepStat}>
              <Text style={styles.sleepStatValue}>96%</Text>
              <Text style={styles.sleepStatLabel}>Avg. SpO2</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacer */}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: fonts.manrope.bold,
    fontSize: 16,
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  bluetoothBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successContainer,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  bluetoothDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  bluetoothText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 11,
    color: colors.success,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.infoContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { flex: 1 },
  statusName: {
    fontFamily: fonts.manrope.semiBold,
    fontSize: 14,
    color: colors.onSurface,
    marginBottom: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  statusLabel: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  statusBadge: {
    backgroundColor: colors.successContainer,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  statusBadgeText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 11,
    color: colors.success,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardFullWidth: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cardHalf: {
    flex: 1,
  },
  sleepCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  sleepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.infoContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepTitle: {
    fontFamily: fonts.manrope.bold,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 2,
  },
  sleepSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  sleepScore: {
    alignItems: 'center',
  },
  sleepScoreValue: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 26,
    color: colors.primary,
    lineHeight: 30,
  },
  sleepScoreLabel: {
    fontFamily: fonts.inter.regular,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sleepDescription: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 16,
  },
  sleepStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 12,
  },
  sleepStat: {
    flex: 1,
    alignItems: 'center',
  },
  sleepStatValue: {
    fontFamily: fonts.manrope.bold,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 2,
  },
  sleepStatLabel: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  sleepStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.outlineVariant,
  },
});
