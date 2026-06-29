import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FloatingTabBar } from '../../shared/components/FloatingTabBar';
import { Colors } from '../../theme/colors';
import StatusScreen from '../../features/dashboard/screens/StatusScreen';
import AlertsScreen from '../../features/alerts/screens/AlertsScreen';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';

type Tab = 'status' | 'alerts' | 'settings';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<Tab>('status');

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
