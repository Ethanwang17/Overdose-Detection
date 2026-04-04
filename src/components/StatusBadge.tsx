import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type BadgeVariant = 'stable' | 'warning' | 'critical' | 'info' | 'system';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  stable:   { bg: colors.successContainer,  text: colors.success },
  warning:  { bg: colors.warningContainer,  text: colors.warning },
  critical: { bg: colors.criticalContainer, text: colors.critical },
  info:     { bg: colors.infoContainer,     text: colors.info },
  system:   { bg: colors.surfaceContainerLow, text: colors.onSurfaceVariant },
};

export default function StatusBadge({ label, variant = 'stable' }: StatusBadgeProps) {
  const style = variantStyles[variant];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.label, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
