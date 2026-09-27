import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

interface AlertItemProps {
  id: string;
  severity: 'elevated' | 'critical';
  dotColor: string;
  severityColor: string;
  severityLabel: string;
  detail: string;
  when: string;
  resolution: string;
  /** Officer view: patient name shown above the vitals detail */
  patientName?: string | null;
  /** Absolute date + time, e.g. "Jul 8 · 2:41 PM" */
  timeLabel?: string;
  latitude?: number | null;
  longitude?: number | null;
  /** Raised from the Demo sheet rather than real vitals */
  isDemo?: boolean;
  /** Officer view: shown until the officer acknowledges the alert */
  onAcknowledge?: () => void;
}

const SEVERITY_BUBBLE: Record<string, { bg: string }> = {
  elevated: { bg: '#FFFBEE' },
  critical:  { bg: '#FFF4F3' },
};

const AlertItem: React.FC<AlertItemProps> = ({
  severity,
  dotColor,
  severityColor,
  severityLabel,
  detail,
  when,
  resolution,
  patientName,
  timeLabel,
  latitude,
  longitude,
  isDemo,
  onAcknowledge,
}) => {
  const bubble = SEVERITY_BUBBLE[severity] ?? SEVERITY_BUBBLE.elevated;
  const hasLocation = latitude != null && longitude != null;

  const openMap = () => {
    if (!hasLocation) return;
    Linking.openURL(`maps://maps.apple.com/?daddr=${latitude},${longitude}`);
  };

  return (
    <View style={[styles.row, { backgroundColor: bubble.bg }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.severityLabel, { color: severityColor }]}>
            {severityLabel}
            {isDemo && <Text style={styles.demoTag}>  DEMO</Text>}
          </Text>
          <Text style={styles.when} numberOfLines={1}>
            {when}
          </Text>
        </View>
        {!!patientName && <Text style={styles.patientName}>{patientName}</Text>}
        <Text style={styles.detail}>{detail}</Text>
        {!!timeLabel && (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{timeLabel}</Text>
            {hasLocation && (
              <TouchableOpacity onPress={openMap} activeOpacity={0.6} style={styles.locationChip}>
                <Text style={styles.locationText}>
                  📍 {latitude!.toFixed(4)}, {longitude!.toFixed(4)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <Text style={styles.resolution}>{resolution}</Text>
        {onAcknowledge && (
          <TouchableOpacity onPress={onAcknowledge} activeOpacity={0.7} style={styles.ackButton}>
            <Text style={styles.ackText}>Acknowledge</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 5,
    borderRadius: 20,
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
    color: '#6E6E73',
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#15151A',
    marginTop: 4,
  },
  detail: {
    fontSize: 15,
    color: '#3A3A40',
    marginTop: 4,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 13,
    color: '#6E6E73',
  },
  locationChip: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  locationText: {
    fontSize: 12,
    color: '#3A3A40',
    fontWeight: '500',
  },
  resolution: {
    fontSize: 13,
    color: '#9A9AA0',
    marginTop: 5,
  },
  demoTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A9AA0',
    letterSpacing: 0.5,
  },
  ackButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#15151A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  ackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AlertItem;
