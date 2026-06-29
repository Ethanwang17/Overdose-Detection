import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';
import { Colors, Shadow } from '../../theme';

type TabKey = 'status' | 'alerts' | 'settings';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
}

// Waveform / heartbeat icon
function StatusIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="2,12 7,12 10,5 14,19 17,12 22,12"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// Three-line list / alerts icon
function AlertsIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Line x1="8" y1="6" x2="21" y2="6" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="8" y1="12" x2="21" y2="12" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="8" y1="18" x2="21" y2="18" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="3" y1="6" x2="3.01" y2="6" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1="3" y1="12" x2="3.01" y2="12" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1="3" y1="18" x2="3.01" y2="18" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

// Two-line sliders / settings icon
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

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'status', label: 'Status' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'settings', label: 'Settings' },
];

function TabIcon({ tabKey, color }: { tabKey: TabKey; color: string }) {
  switch (tabKey) {
    case 'status':
      return <StatusIcon color={color} />;
    case 'alerts':
      return <AlertsIcon color={color} />;
    case 'settings':
      return <SettingsIcon color={color} />;
  }
}

export function FloatingTabBar({ activeTab, onTabPress }: FloatingTabBarProps) {
  const isIOS = Platform.OS === 'ios';

  const inner = (
    <View style={styles.inner}>
      {TABS.map(({ key, label }) => {
        const isActive = key === activeTab;
        const iconColor = isActive ? Colors.ink : Colors.textDisabled;

        return (
          <TouchableOpacity
            key={key}
            onPress={() => onTabPress(key)}
            style={[styles.tabButton, isActive ? styles.tabButtonActive : styles.tabButtonInactive]}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
          >
            <TabIcon tabKey={key} color={iconColor} />
            {isActive && (
              <Text style={styles.tabLabel}>{label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (isIOS) {
    return (
      <BlurView
        intensity={80}
        tint="light"
        style={styles.container}
      >
        {inner}
      </BlurView>
    );
  }

  // Android fallback — solid-ish bg
  return (
    <View style={[styles.container, styles.containerFallback]}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 26,
    alignSelf: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.navBorder,
    overflow: 'hidden',
    ...Shadow.nav,
  },
  containerFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 7,
    // On iOS the BlurView provides the bg; on Android containerFallback does.
    backgroundColor: 'transparent',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  tabButtonActive: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    backgroundColor: Colors.tabActive,
    gap: 8,
  },
  tabButtonInactive: {
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

export default FloatingTabBar;
