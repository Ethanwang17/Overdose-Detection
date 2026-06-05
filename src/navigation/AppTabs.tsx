import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/app/HomeScreen';
import HistoryScreen from '../screens/app/HistoryScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import { colors } from '../theme/colors';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const ICONS: Record<
  keyof AppTabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  History: { active: 'grid', inactive: 'grid-outline' },
  Settings: { active: 'bookmark', inactive: 'bookmark-outline' },
};

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = ICONS[route.name as keyof AppTabParamList];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.item, focused && styles.itemActive]}
            >
              <Ionicons
                name={focused ? icon.active : icon.inactive}
                size={26}
                color={focused ? colors.onSurface : colors.outlineVariant}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  item: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  itemActive: {
    backgroundColor: colors.surfaceContainerLow,
  },
});

export default function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
