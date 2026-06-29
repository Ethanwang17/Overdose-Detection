import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VitalMetricProps {
  label: string;
  value: string;
  unit: string;
  note: string;
  color: string;
}

export default function VitalMetric({ label, value, unit, note, color }: VitalMetricProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.note}>{note}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingVertical: 26,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#86868B',
  },
  note: {
    fontSize: 13,
    color: '#A8A8AE',
    textAlign: 'right',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    marginTop: 10,
  },
  value: {
    fontSize: 58,
    fontWeight: '700',
    lineHeight: 52,
    letterSpacing: -1.5,
  },
  unit: {
    fontSize: 18,
    fontWeight: '500',
    color: '#86868B',
    paddingBottom: 6,
  },
});
