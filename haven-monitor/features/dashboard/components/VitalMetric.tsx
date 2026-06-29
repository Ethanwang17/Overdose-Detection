import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface VitalMetricProps {
  label: string;
  value: string;
  unit: string;
  note: string;
  color: string;
}

export default function VitalMetric({ label, value, unit, note, color }: VitalMetricProps) {
  return (
    <View style={styles.card}>
      <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.note}>{note}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text
            style={[styles.value, { color }]}
            adjustsFontSizeToFit
            minimumFontScale={0.3}
            numberOfLines={1}
          >
            {value}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#8A90A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3F',
    letterSpacing: 0.1,
  },
  note: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6E6E73',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    fontSize: 80,
    fontWeight: '700',
    letterSpacing: -2.5,
    flexShrink: 1,
  },
  unit: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3A3A3F',
    flexShrink: 0,
  },
});
