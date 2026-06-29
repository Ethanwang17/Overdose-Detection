import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import { Colors } from '../../../theme/colors';
import ParoleOfficerDashboard from '../screens/ParoleOfficerDashboard';
import SettingsScreen from '../../settings/screens/SettingsScreen';

type OfficerTab = 'patients' | 'settings';

function PatientsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3.5" stroke={color} strokeWidth={1.9} />
      <Line x1="3" y1="20" x2="15" y2="20" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="3" y1="20" x2="3" y2="16" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="15" y1="20" x2="15" y2="16" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="3" y1="16" x2="15" y2="16" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Circle cx="18" cy="8" r="2.5" stroke={color} strokeWidth={1.9} />
      <Line x1="16" y1="20" x2="21" y2="20" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="16" y1="20" x2="16" y2="17" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="21" y1="20" x2="21" y2="17" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="16" y1="17" x2="21" y2="17" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="8" x2="20" y2="8" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="4" y1="16" x2="20" y2="16" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Circle cx="8" cy="8" r="2.5" fill={Colors.white} stroke={color} strokeWidth={1.9} />
      <Circle cx="16" cy="16" r="2.5" fill={Colors.white} stroke={color} strokeWidth={1.9} />
    </Svg>
  );
}

const OFFICER_TABS: Array<{ key: OfficerTab; label: string }> = [
  { key: 'patients', label: 'Patients' },
  { key: 'settings', label: 'Settings' },
];

function OfficerTabBar({ activeTab, onTabPress }: { activeTab: OfficerTab; onTabPress: (t: OfficerTab) => void }) {
  const isIOS = Platform.OS === 'ios';

  const inner = (
    <View style={styles.inner}>
      {OFFICER_TABS.map(({ key, label }) => {
        const isActive = key === activeTab;
        const iconColor = isActive ? Colors.ink : '#8E8E93';
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onTabPress(key)}
            style={[styles.tabButton, isActive ? styles.tabActive : styles.tabInactive]}
            activeOpacity={0.75}
          >
            {key === 'patients'
              ? <PatientsIcon color={iconColor} />
              : <SettingsIcon color={iconColor} />}
            {isActive && <Text style={styles.tabLabel}>{label}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (isIOS) {
    return (
      <BlurView intensity={90} tint="extraLight" style={styles.pill}>
        {inner}
      </BlurView>
    );
  }
  return <View style={[styles.pill, styles.pillFallback]}>{inner}</View>;
}

export default function OfficerShell() {
  const [activeTab, setActiveTab] = useState<OfficerTab>('patients');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {activeTab === 'patients' && <ParoleOfficerDashboard />}
      {activeTab === 'settings' && <SettingsScreen />}
      <OfficerTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF0F5', position: 'relative' },
  pill: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
  pillFallback: { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  tabActive: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    backgroundColor: Colors.tabActive,
    gap: 8,
  },
  tabInactive: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.1,
  },
});
