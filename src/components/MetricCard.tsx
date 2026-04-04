import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import StatusBadge from './StatusBadge';

type BadgeVariant = 'stable' | 'warning' | 'critical' | 'info' | 'system';

interface SparklineProps {
  data: number[];
}

function Sparkline({ data }: SparklineProps) {
  const max = Math.max(...data);
  return (
    <View style={sparkStyles.container}>
      {data.map((val, i) => (
        <View
          key={i}
          style={[
            sparkStyles.bar,
            {
              height: Math.max(4, (val / max) * 36),
              backgroundColor: i >= data.length - 3 ? colors.secondary : colors.outlineVariant,
            },
          ]}
        />
      ))}
    </View>
  );
}

const sparkStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 3,
    marginTop: 12,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
  },
});

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  sparkline?: number[];
  style?: object;
  accent?: string;
}

export default function MetricCard({
  icon,
  label,
  value,
  unit,
  badge,
  badgeVariant = 'stable',
  sparkline,
  style,
  accent = colors.secondary,
}: MetricCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {badge ? <StatusBadge label={badge} variant={badgeVariant} /> : null}
      {sparkline ? <Sparkline data={sparkline} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#1a1c1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 8,
  },
  value: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 40,
    color: colors.onSurface,
    lineHeight: 48,
  },
  unit: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
});
