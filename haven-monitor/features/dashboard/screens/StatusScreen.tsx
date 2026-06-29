import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useBiometricStore } from '../../../features/biometrics/store/biometricStore';
import StatusCard from '../components/StatusCard';
import VitalMetric from '../components/VitalMetric';
import EmergencyOverlay from '../components/EmergencyOverlay';
import DemoSheet from '../components/DemoSheet';
import { Colors, FontSize, FontWeight } from '../../../theme';

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
    startEmergency,
    stopEmergency,
    setStatus,
    getVitalStatus,
  } = useBiometricStore();

  const [demoOpen, setDemoOpen] = useState(false);

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
    if (status === 'elevated') return 'Above normal';
    if (status === 'critical') return 'Critically low';
    return 'Normal range';
  };
  const getSpo2Note = () => {
    if (status === 'critical') return 'Critically low';
    if (status === 'elevated') return 'Slightly low';
    return 'Normal range';
  };
  const getRrNote = () => {
    if (status === 'critical') return 'Critically low';
    if (status === 'elevated') return 'Above normal';
    return 'Normal range';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>Alex Morgan</Text>
          </View>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => setDemoOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.demoButtonText}>Demo</Text>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.cardWrapper}>
          <StatusCard
            status={vitalStatus.status}
            label={vitalStatus.label}
            sublabel={vitalStatus.sublabel}
            updatedText={vitalStatus.updatedText}
            dotColor={vitalStatus.dotColor}
            tintColor={vitalStatus.tintColor}
            textColor={vitalStatus.textColor}
          />
        </View>

        {/* Vital Metrics */}
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
      </ScrollView>

      {/* Emergency Overlay */}
      <EmergencyOverlay
        visible={emergency || calling}
        countdown={countdown}
        calling={calling}
        onImOk={stopEmergency}
        onCallHelp={() => {
          setCalling(true);
          clearCountdownTimer();
        }}
      />

      {/* Demo Bottom Sheet */}
      <DemoSheet
        visible={demoOpen}
        onClose={() => setDemoOpen(false)}
        onSetNormal={() => {
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
        }}
        onTriggerEmergency={() => {
          setDemoOpen(false);
          setStatus('critical');
          startEmergency();
        }}
        onRestartOnboarding={() => {
          setDemoOpen(false);
          router.replace('/onboarding');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 150,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  demoButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  cardWrapper: {
    marginTop: 22,
  },
});
