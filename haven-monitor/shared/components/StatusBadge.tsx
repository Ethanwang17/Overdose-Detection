import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { Colors, FontSize, FontWeight } from '../../theme';

type Severity = 'normal' | 'elevated' | 'critical';

interface StatusBadgeProps {
  label: string;
  severity: Severity;
  style?: StyleProp<ViewStyle>;
}

interface SeverityTokens {
  bg: string;
  text: string;
  dot: string;
}

const SEVERITY_TOKENS: Record<Severity, SeverityTokens> = {
  normal: {
    bg: Colors.greenTint,
    text: Colors.greenDark,
    dot: Colors.green,
  },
  elevated: {
    bg: Colors.amberBadgeTint,
    text: Colors.amberDark,
    dot: Colors.amber,
  },
  critical: {
    bg: Colors.redBadgeTint,
    text: Colors.redDark,
    dot: Colors.red,
  },
};

export function StatusBadge({ label, severity, style }: StatusBadgeProps) {
  const tokens = SEVERITY_TOKENS[severity];

  return (
    <View style={[styles.badge, { backgroundColor: tokens.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: tokens.dot }]} />
      <Text style={[styles.label, { color: tokens.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.1,
  },
});

export default StatusBadge;
