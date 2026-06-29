import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AlertItemProps {
  id: string;
  severity: 'elevated' | 'critical';
  dotColor: string;
  severityColor: string;
  severityLabel: string;
  detail: string;
  when: string;
  resolution: string;
}

const AlertItem: React.FC<AlertItemProps> = ({
  id,
  severity,
  dotColor,
  severityColor,
  severityLabel,
  detail,
  when,
  resolution,
}) => {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.severityLabel, { color: severityColor }]}>
            {severityLabel}
          </Text>
          <Text style={styles.when} numberOfLines={1}>
            {when}
          </Text>
        </View>
        <Text style={styles.detail}>{detail}</Text>
        <Text style={styles.resolution}>{resolution}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginTop: 6,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  when: {
    fontSize: 13,
    color: '#A8A8AE',
  },
  detail: {
    fontSize: 15,
    color: '#3A3A40',
    marginTop: 4,
    lineHeight: 21,
  },
  resolution: {
    fontSize: 13,
    color: '#9A9AA0',
    marginTop: 5,
  },
});

export default AlertItem;
