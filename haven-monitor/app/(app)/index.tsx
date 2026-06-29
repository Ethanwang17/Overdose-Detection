import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FloatingTabBar } from '../../shared/components/FloatingTabBar';
import { Colors } from '../../theme/colors';
import StatusScreen from '../../features/dashboard/screens/StatusScreen';
import AlertsScreen from '../../features/alerts/screens/AlertsScreen';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';
import OfficerShell from '../../features/monitoring/components/OfficerShell';
import { useAuthStore } from '../../features/authentication/store/authStore';
import { LocationService } from '../../services/LocationService';
import { useVitalsSync } from '../../features/biometrics/hooks/useVitalsSync';

const LOCATION_SYNC_MS = 60_000;

type Tab = 'status' | 'alerts' | 'settings';

export default function AppShell() {
  const { profile, session } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('status');

  // Patient: push vitals to Supabase on every store change (catches demo mode switches too)
  useVitalsSync();

  // Patient: sync location every 60s
  const locationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (profile?.role !== 'patient' || !session?.user.id) return;
    const userId = session.user.id;
    LocationService.requestPermissions().then((granted) => {
      if (!granted) return;
      LocationService.pushToDatabase(userId).catch(() => {});
      locationTimerRef.current = setInterval(() => {
        LocationService.pushToDatabase(userId).catch(() => {});
      }, LOCATION_SYNC_MS);
    });
    return () => { if (locationTimerRef.current) clearInterval(locationTimerRef.current); };
  }, [profile?.role, session?.user.id]);

  const isLoading = useAuthStore((s) => s.isLoading);
  if (isLoading || !profile) return null;

  if (profile.role === 'parole_officer') {
    return <OfficerShell />;
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
});
