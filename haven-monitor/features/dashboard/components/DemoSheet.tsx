import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface DemoSheetProps {
  visible: boolean;
  onClose: () => void;
  onSetNormal: () => void;
  onSetElevated: () => void;
  onSetOverdose: () => void;
  onTriggerEmergency: () => void;
  onRestartOnboarding: () => void;
  // Present only when HealthKit is a live data source on this build —
  // hands the display back from demo values to real samples.
  onResumeLive?: () => void;
}

const STATUS_OPTIONS = [
  {
    key: 'normal',
    label: 'Normal',
    desc: 'All vitals in range',
    dot: '#30A15C',
    bg: 'rgba(48, 161, 92, 0.10)',
    textColor: '#1F7A42',
  },
  {
    key: 'elevated',
    label: 'Elevated',
    desc: 'Slightly out of range',
    dot: '#E0980A',
    bg: 'rgba(224, 152, 10, 0.11)',
    textColor: '#9A6500',
  },
  {
    key: 'overdose',
    label: 'Overdose',
    desc: 'Critical vitals detected',
    dot: '#E5484D',
    bg: 'rgba(229, 72, 77, 0.10)',
    textColor: '#C0282D',
  },
] as const;

export default function DemoSheet({
  visible,
  onClose,
  onSetNormal,
  onSetElevated,
  onSetOverdose,
  onTriggerEmergency,
  onRestartOnboarding,
  onResumeLive,
}: DemoSheetProps) {
  const handlers = { normal: onSetNormal, elevated: onSetElevated, overdose: onSetOverdose };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Demo Simulator</Text>
            <Text style={styles.subtitle}>Simulate monitoring states on this device</Text>
          </View>

          {/* Status buttons */}
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.statusButton, { backgroundColor: opt.bg }]}
                onPress={handlers[opt.key]}
                activeOpacity={0.75}
              >
                <View style={[styles.dot, { backgroundColor: opt.dot }]} />
                <Text style={[styles.statusLabel, { color: opt.textColor }]}>{opt.label}</Text>
                <Text style={[styles.statusDesc, { color: opt.textColor }]}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Trigger Emergency */}
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={onTriggerEmergency}
            activeOpacity={0.85}
          >
            <Text style={styles.emergencyLabel}>Trigger Emergency Alert</Text>
            <Text style={styles.emergencyDesc}>Starts 30-second countdown immediately</Text>
          </TouchableOpacity>

          {/* Resume live HealthKit data */}
          {onResumeLive && (
            <TouchableOpacity
              style={styles.liveButton}
              onPress={onResumeLive}
              activeOpacity={0.85}
            >
              <Text style={styles.liveLabel}>Resume Live Data</Text>
              <Text style={styles.liveDesc}>Show real readings from Apple Health</Text>
            </TouchableOpacity>
          )}

          {/* Restart Onboarding */}
          <TouchableOpacity
            style={styles.restartButton}
            onPress={onRestartOnboarding}
            activeOpacity={0.7}
          >
            <Text style={styles.restartText}>Restart Onboarding</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 20, 0.40)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    alignSelf: 'center',
    marginBottom: 22,
  },
  header: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15151A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#86868B',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 9,
  },
  statusButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusDesc: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.07)',
    marginVertical: 16,
  },
  emergencyButton: {
    backgroundColor: '#15151A',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  liveButton: {
    backgroundColor: 'rgba(48, 161, 92, 0.10)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  liveLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F7A42',
    letterSpacing: -0.2,
  },
  liveDesc: {
    fontSize: 13,
    color: '#1F7A42',
    opacity: 0.75,
    marginTop: 3,
  },
  emergencyLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  emergencyDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 3,
  },
  restartButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#86868B',
  },
});
