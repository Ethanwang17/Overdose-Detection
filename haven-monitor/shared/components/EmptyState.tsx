import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon, title, subtitle, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ? (
        <Text style={styles.icon} accessibilityLabel="">
          {icon}
        </Text>
      ) : null}

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}

      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          style={styles.actionButton}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.huge,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },
  actionButton: {
    marginTop: Spacing.base,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: Colors.ink,
  },
  actionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
    letterSpacing: -0.1,
  },
});

export default EmptyState;
