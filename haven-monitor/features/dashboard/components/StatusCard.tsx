import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface StatusCardProps {
  status: 'normal' | 'elevated' | 'critical';
  label: string;
  sublabel: string;
  updatedText: string;
  dotColor: string;
  tintColor: string;
  textColor: string;
}

export default function StatusCard({
  status,
  label,
  sublabel,
  updatedText,
  dotColor,
  tintColor,
  textColor,
}: StatusCardProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'critical') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 550,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  return (
    <View style={[styles.container, { backgroundColor: tintColor }]}>
      <View style={styles.topRow}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColor, opacity: status === 'critical' ? pulseAnim : 1 },
          ]}
        />
        <Text style={[styles.statusLabel, { color: textColor }]}>STATUS</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sublabel}>{sublabel}</Text>
      <Text style={styles.updatedText}>{updatedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 26,
    paddingVertical: 26,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.6,
  },
  label: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 44,
    marginTop: 14,
    color: '#15151A',
  },
  sublabel: {
    fontSize: 16,
    color: '#3A3A3F',
    lineHeight: 22,
    marginTop: 8,
  },
  updatedText: {
    fontSize: 13,
    color: '#6E6E73',
    marginTop: 16,
  },
});
