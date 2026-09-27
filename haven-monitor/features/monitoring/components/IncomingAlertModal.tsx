import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { EMERGENCY_NUMBER } from '../../../constants';
import type { AlertRecord } from '../../../types';

interface IncomingAlertModalProps {
  alert: AlertRecord | null;
  /** Alerts waiting, including this one */
  pending: number;
  onAcknowledge: (id: string) => Promise<void>;
  onLater: (id: string) => void;
}

/**
 * Officer: full-screen takeover for a new patient alert — the in-app
 * equivalent of a call. Name, severity, time and location up front, with
 * dispatch one tap away.
 */
export default function IncomingAlertModal({ alert, pending, onAcknowledge, onLater }: IncomingAlertModalProps) {
  const [acking, setAcking] = useState(false);
  if (!alert) return null;

  const critical = alert.severity === 'critical';
  const hasLocation = alert.latitude != null && alert.longitude != null;

  const handleAcknowledge = async () => {
    setAcking(true);
    try {
      await onAcknowledge(alert.id);
    } catch (err) {
      Alert.alert('Could not acknowledge', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setAcking(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.banner, critical ? styles.bannerCritical : styles.bannerElevated]}>
            <Text style={styles.bannerLabel}>{critical ? 'POSSIBLE OVERDOSE' : 'ELEVATED RISK'}</Text>
            {pending > 1 && <Text style={styles.bannerCount}>1 of {pending}</Text>}
          </View>

          <View style={styles.body}>
            <Text style={styles.name}>{alert.patientName ?? 'Patient'}</Text>
            <Text style={styles.time}>
              {alert.timeLabel} · {alert.when}
              {alert.source === 'demo' ? ' · DEMO' : ''}
            </Text>
            <Text style={styles.detail}>{alert.detail}</Text>

            {alert.escalatedAt && (
              <Text style={styles.escalated}>Patient didn't respond to the emergency countdown</Text>
            )}
            {alert.resolvedAt && <Text style={styles.resolved}>{alert.resolution}</Text>}

            {hasLocation ? (
              <TouchableOpacity
                style={styles.locationRow}
                activeOpacity={0.7}
                onPress={() => Linking.openURL(`maps://maps.apple.com/?daddr=${alert.latitude},${alert.longitude}`)}
              >
                <Text style={styles.locationText}>
                  📍 {alert.latitude!.toFixed(4)}, {alert.longitude!.toFixed(4)} — Open in Maps
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noLocation}>No location with this alert</Text>
            )}

            <TouchableOpacity
              style={styles.callButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(`tel:${EMERGENCY_NUMBER}`)}
            >
              <Text style={styles.callText}>Call {EMERGENCY_NUMBER}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ackButton, acking && styles.busy]}
              activeOpacity={0.85}
              onPress={handleAcknowledge}
              disabled={acking}
            >
              <Text style={styles.ackText}>{acking ? 'Acknowledging…' : 'Acknowledge'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.laterButton} activeOpacity={0.6} onPress={() => onLater(alert.id)}>
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 22, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.3,
    shadowRadius: 60,
    elevation: 24,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  bannerCritical: { backgroundColor: '#E5484D' },
  bannerElevated: { backgroundColor: '#E0980A' },
  bannerLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 1.6, color: '#FFFFFF' },
  bannerCount: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  body: { padding: 22, gap: 8 },
  name: { fontSize: 26, fontWeight: '700', color: '#15151A', letterSpacing: -0.4 },
  time: { fontSize: 14, color: '#6E6E73' },
  detail: { fontSize: 16, color: '#3A3A40', lineHeight: 22, marginTop: 4 },
  escalated: { fontSize: 14, fontWeight: '600', color: '#C0282D' },
  resolved: { fontSize: 14, color: '#6E6E73' },
  locationRow: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  locationText: { fontSize: 14, fontWeight: '500', color: '#15151A' },
  noLocation: { fontSize: 14, color: '#9A9AA0', marginTop: 4 },
  callButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#E5484D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  callText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  ackButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#15151A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ackText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  busy: { opacity: 0.7 },
  laterButton: { height: 40, alignItems: 'center', justifyContent: 'center' },
  laterText: { fontSize: 15, fontWeight: '500', color: '#9A9AA0' },
});
