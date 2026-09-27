import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBiometricStore } from '../../../features/biometrics/store/biometricStore';
import { useAuthStore } from '../../authentication/store/authStore';
import { useReadinessStore } from '../../onboarding/store/readinessStore';
import { HealthService } from '../../../services/HealthService';
import { AlertService } from '../../../services/AlertService';
import StatusCard from '../components/StatusCard';
import VitalMetric from '../components/VitalMetric';
import EmergencyOverlay from '../components/EmergencyOverlay';
import DemoSheet from '../components/DemoSheet';
import { Colors, FontSize, FontWeight } from '../../../theme';
import { EMERGENCY_NUMBER } from '../../../constants';

async function callEmergencyNumber() {
  const url = `tel:${EMERGENCY_NUMBER}`;
  if (await Linking.canOpenURL(url)) {
    Linking.openURL(url);
  } else {
    Alert.alert('Calling unavailable', `This device can't place calls. Call ${EMERGENCY_NUMBER} from a phone.`);
  }
}

export default function StatusScreen() {
  const {
    reading,
    status,
    emergency,
    countdown,
    calling,
    setCalling,
    clearCountdownTimer,
    changeMode,
    resumeLive,
    startEmergency,
    stopEmergency,
    setStatus,
    getVitalStatus,
  } = useBiometricStore();

  const profile = useAuthStore((s) => s.profile);
  const userId = useAuthStore((s) => s.session?.user.id);
  const displayName = profile?.name ?? 'there';

  const [demoOpen, setDemoOpen] = useState(false);

  // The countdown ran out or the patient asked for help: escalate the open
  // alert so their officer sees it isn't being handled.
  const wasCalling = useRef(calling);
  useEffect(() => {
    if (calling && !wasCalling.current && userId) {
      const current = useBiometricStore.getState().reading;
      AlertService.escalate(
        userId,
        'Emergency countdown expired without a response',
        current?.source ?? 'unknown',
      ).catch(() => {});
    }
    wasCalling.current = calling;
  }, [calling, userId]);

  const handleCallHelp = () => {
    setCalling(true);
    clearCountdownTimer();
    callEmergencyNumber();
  };

  const handleImOk = async () => {
    stopEmergency();
    if (userId) await AlertService.resolveOpen(userId, 'Marked OK by patient').catch(() => {});
    // Resolve first so the demo's return to normal doesn't overwrite the
    // resolution with "Vitals returned to normal".
    if (useBiometricStore.getState().demoActive) changeMode('normal');
  };

  const vitalStatus = getVitalStatus();

  // Vital value colors based on status
  const getHrColor = () => {
    if (status === 'critical') return Colors.redDark;
    if (status === 'elevated') return Colors.amberDark;
    return Colors.ink;
  };
  const getSpo2Color = () => {
    if (status === 'critical') return Colors.redDark;
    return Colors.ink;
  };
  const getRrColor = () => {
    if (status === 'critical') return Colors.redDark;
    if (status === 'elevated') return Colors.amberDark;
    return Colors.ink;
  };

  // Vital note text based on status
  const getHrNote = () => {
    if (!reading) return 'Waiting for data';
    if (status === 'elevated') return 'Above normal';
    if (status === 'critical') return 'Critically low';
    return 'Normal Range';
  };
  const getSpo2Note = () => {
    if (!reading) return 'Waiting for data';
    if (status === 'critical') return 'Critically low';
    if (status === 'elevated') return 'Slightly low';
    return 'Normal Range';
  };
  const getRrNote = () => {
    if (!reading) return 'Waiting for data';
    if (status === 'critical') return 'Critically low';
    if (status === 'elevated') return 'Above normal';
    return 'Normal Range';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          {/* Development builds only: the demo can feed fake vitals to the
              officer, so a real patient must never have it. */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => setDemoOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.demoButtonText}>Demo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Card — "Normal" is only claimed once there's a reading */}
        <View style={styles.cardWrapper}>
          {reading ? (
            <StatusCard
              status={vitalStatus.status}
              label={vitalStatus.label}
              sublabel={vitalStatus.sublabel}
              updatedText={vitalStatus.updatedText}
              dotColor={vitalStatus.dotColor}
              tintColor={vitalStatus.tintColor}
              textColor={vitalStatus.textColor}
            />
          ) : (
            <StatusCard
              status="normal"
              label="No data yet"
              sublabel="Waiting for the first reading from your Apple Watch."
              updatedText="Not live"
              dotColor={Colors.textDisabled}
              tintColor="rgba(0, 0, 0, 0.05)"
              textColor={Colors.textSecondary}
            />
          )}
        </View>
      </View>

      {/* Vital Metrics — fill remaining space */}
      <View style={styles.vitalsContainer}>
        <VitalMetric
          label="Heart Rate"
          value={reading?.heartRate?.toString() ?? '--'}
          unit="BPM"
          note={getHrNote()}
          color={getHrColor()}
        />
        <VitalMetric
          label="Blood Oxygen"
          value={reading?.spo2?.toString() ?? '--'}
          unit="% SpO₂"
          note={getSpo2Note()}
          color={getSpo2Color()}
        />
        <VitalMetric
          label="Respiratory Rate"
          value={reading?.respiratoryRate?.toString() ?? '--'}
          unit="/min"
          note={getRrNote()}
          color={getRrColor()}
        />
      </View>

      {/* Emergency Overlay */}
      <EmergencyOverlay
        visible={emergency || calling}
        countdown={countdown}
        calling={calling}
        emergencyNumber={EMERGENCY_NUMBER}
        onImOk={handleImOk}
        onCallHelp={handleCallHelp}
      />

      {/* Demo Bottom Sheet */}
      <DemoSheet
        visible={demoOpen}
        onClose={() => setDemoOpen(false)}
        onSetNormal={() => {
          stopEmergency();
          changeMode('normal');
          setDemoOpen(false);
        }}
        onSetElevated={() => {
          changeMode('elevated');
          setDemoOpen(false);
        }}
        onSetOverdose={() => {
          changeMode('critical');
          setDemoOpen(false);
          // Same response as real critical vitals (see useHealthKitVitals)
          setTimeout(startEmergency, 650);
        }}
        onTriggerEmergency={() => {
          setDemoOpen(false);
          setStatus('critical');
          startEmergency();
        }}
        onRestartOnboarding={() => {
          setDemoOpen(false);
          useReadinessStore.getState().forceFullOnboarding();
        }}
        onResumeLive={
          HealthService.isAvailable()
            ? () => {
                resumeLive();
                setDemoOpen(false);
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#EEF0F5',
  },
  top: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  greeting: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },
  name: {
    fontSize: FontSize.heading3,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginTop: 2,
  },
  demoButton: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  demoButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  cardWrapper: {
    marginTop: 14,
  },
  vitalsContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 108,
    gap: 10,
  },
});
