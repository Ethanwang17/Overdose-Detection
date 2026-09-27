import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FloatingTabBar } from '../../shared/components/FloatingTabBar';
import { Colors } from '../../theme/colors';
import StatusScreen from '../../features/dashboard/screens/StatusScreen';
import AlertsScreen from '../../features/alerts/screens/AlertsScreen';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';
import OfficerShell from '../../features/monitoring/components/OfficerShell';
import CompleteSetupScreen from '../../features/authentication/screens/CompleteSetupScreen';
import OnboardingScreen from '../../features/onboarding/screens/OnboardingScreen';
import { useAuthStore } from '../../features/authentication/store/authStore';
import { useReadinessStore } from '../../features/onboarding/store/readinessStore';
import { useReadinessMonitor } from '../../features/onboarding/hooks/useReadinessMonitor';
import { LocationService } from '../../services/LocationService';
import { useVitalsSync } from '../../features/biometrics/hooks/useVitalsSync';
import { useHealthKitVitals } from '../../features/biometrics/hooks/useHealthKitVitals';
import { useAlertSync } from '../../features/alerts/hooks/useAlertSync';

const LOCATION_SYNC_MS = 60_000;

type Tab = 'status' | 'alerts' | 'settings';

export default function AppShell() {
  const { profile, session, error } = useAuthStore();
  const isLoading = useAuthStore((s) => s.isLoading);
  const [activeTab, setActiveTab] = useState<Tab>('status');

  const isPatient = profile?.role === 'patient';
  const userId = session?.user.id;

  // Patient: push vitals to Supabase as they change, plus a heartbeat
  useVitalsSync(isPatient);

  // Patient: pull real HealthKit samples into the store (dev/prod builds
  // on iOS only — no-op in Expo Go and on Android)
  useHealthKitVitals(isPatient);

  // Patient: record status transitions (demo or real) as alert rows so
  // both the patient and their officer see them in the Alerts tab
  useAlertSync(isPatient);

  // Patient: watch/location/contact checks that decide whether onboarding
  // (first time, or again after something was lost) must be shown
  useReadinessMonitor(isPatient, userId, profile);
  const readiness = useReadinessStore((s) => s.result);
  const steps = useReadinessStore((s) => s.steps);
  const forcedFull = useReadinessStore((s) => s.forcedFull);
  const refreshReadiness = useReadinessStore((s) => s.refresh);
  const clearForced = useReadinessStore((s) => s.clearForced);

  // Patient: sync location every 60s. Onboarding asks for the permission;
  // this only reports while it's granted.
  useEffect(() => {
    if (!isPatient || !userId) return;
    LocationService.pushToDatabase(userId).catch(() => {});
    const timer = setInterval(() => {
      LocationService.pushToDatabase(userId).catch(() => {});
    }, LOCATION_SYNC_MS);
    return () => clearInterval(timer);
  }, [isPatient, userId]);

  if (isLoading || (!profile && !error)) return null;
  // Signed in but profile creation failed (e.g. registration interrupted
  // by email confirmation) — offer recovery instead of a blank screen.
  if (!profile) return <CompleteSetupScreen />;

  // Officers are never onboarded.
  if (profile.role === 'parole_officer') {
    return <OfficerShell />;
  }

  if (!readiness) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.ink} />
      </View>
    );
  }

  if (steps.length) {
    const firstTime = readiness.firstTime || forcedFull;
    return (
      <OnboardingScreen
        key={firstTime ? 'setup' : 'repair'}
        steps={steps}
        firstTime={firstTime}
        userId={profile.id}
        onFinished={() => {
          clearForced();
          return refreshReadiness(profile.id, useAuthStore.getState().profile ?? profile);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {activeTab === 'status' && <StatusScreen />}
      {activeTab === 'alerts' && <AlertsScreen />}
      {activeTab === 'settings' && <SettingsScreen />}
      <FloatingTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgScreen, position: 'relative' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
});
