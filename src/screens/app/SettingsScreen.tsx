import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

interface ToggleRowProps {
  label: string;
  subtitle: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}

function ToggleRow({ label, subtitle, value, onToggle }: ToggleRowProps) {
  return (
    <View style={toggleStyles.row}>
      <View style={toggleStyles.text}>
        <Text style={toggleStyles.label}>{label}</Text>
        <Text style={toggleStyles.subtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceContainerLow, true: colors.primaryContainer }}
        thumbColor={value ? colors.secondary : colors.outlineVariant}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  text: { flex: 1, marginRight: 12 },
  label: {
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurface,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});

interface NavRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

function NavRow({ icon, label, onPress, danger }: NavRowProps) {
  return (
    <TouchableOpacity onPress={onPress} style={navStyles.row} activeOpacity={0.7}>
      <View style={[navStyles.iconWrap, danger && navStyles.dangerIconWrap]}>
        <Ionicons name={icon} size={18} color={danger ? colors.critical : colors.onSurfaceVariant} />
      </View>
      <Text style={[navStyles.label, danger && navStyles.dangerLabel]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.outlineVariant} />}
    </TouchableOpacity>
  );
}

const navStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIconWrap: {
    backgroundColor: colors.criticalContainer,
  },
  label: {
    flex: 1,
    fontFamily: fonts.inter.medium,
    fontSize: 14,
    color: colors.onSurface,
  },
  dangerLabel: {
    color: colors.critical,
  },
});

function SectionLabel({ label }: { label: string }) {
  return <Text style={sectionStyles.label}>{label}</Text>;
}

const sectionStyles = StyleSheet.create({
  label: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 4,
  },
});

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.surfaceContainerLow }} />;
}

export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);

  const [autoSync, setAutoSync] = useState(true);
  const [backgroundMonitoring, setBackgroundMonitoring] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [softwareUpdates, setSoftwareUpdates] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your profile and preferences</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile section */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Dr. Adrian Sterling</Text>
            <Text style={styles.profileEmail}>adrian.sterling@medical.io</Text>
            <Text style={styles.profileId}>Patient ID: PM-2024-0042</Text>
          </View>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Wearable Integration */}
        <SectionLabel label="Wearable Integration" />
        <View style={styles.sectionCard}>
          {/* Fitbit connected card */}
          <View style={styles.fitbitCard}>
            <View style={styles.fitbitLeft}>
              <View style={styles.fitbitIconWrap}>
                <Ionicons name="watch-outline" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.fitbitTitle}>Fitbit Sense 2</Text>
                <View style={styles.fitbitStatusRow}>
                  <View style={styles.connectedDot} />
                  <Text style={styles.fitbitStatus}>Connected · Last Sync 2m ago</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.disconnectButton}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>

          <Divider />
          <ToggleRow
            label="Auto-sync Data"
            subtitle="Sync biometric data automatically"
            value={autoSync}
            onToggle={setAutoSync}
          />
          <Divider />
          <ToggleRow
            label="Background Monitoring"
            subtitle="Continue monitoring when app is closed"
            value={backgroundMonitoring}
            onToggle={setBackgroundMonitoring}
          />
        </View>

        {/* Notifications */}
        <SectionLabel label="Notifications" />
        <View style={styles.sectionCard}>
          <ToggleRow
            label="Critical Health Alerts"
            subtitle="Immediate alerts for threshold violations"
            value={criticalAlerts}
            onToggle={setCriticalAlerts}
          />
          <Divider />
          <ToggleRow
            label="Weekly Summary"
            subtitle="Receive a weekly biometric report"
            value={weeklySummary}
            onToggle={setWeeklySummary}
          />
          <Divider />
          <ToggleRow
            label="Software Updates"
            subtitle="Notify when app updates are available"
            value={softwareUpdates}
            onToggle={setSoftwareUpdates}
          />
        </View>

        {/* System */}
        <SectionLabel label="System" />
        <View style={styles.sectionCard}>
          <NavRow icon="lock-closed-outline" label="Privacy & Security" />
          <Divider />
          <NavRow icon="help-circle-outline" label="Support Center" />
          <Divider />
          <NavRow icon="log-out-outline" label="Sign Out" onPress={logout} danger />
        </View>

        {/* App version */}
        <Text style={styles.versionText}>Precision Monitoring v1.0.0 · HIPAA Compliant</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 22,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.infoContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: fonts.manrope.bold,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  profileId: {
    fontFamily: fonts.inter.medium,
    fontSize: 11,
    color: colors.secondary,
    letterSpacing: 0.3,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerLow,
  },
  editButtonText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  sectionCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  fitbitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  fitbitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fitbitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.infoContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitbitTitle: {
    fontFamily: fonts.manrope.bold,
    fontSize: 14,
    color: colors.onSurface,
    marginBottom: 3,
  },
  fitbitStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  fitbitStatus: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  disconnectButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: colors.criticalContainer,
  },
  disconnectText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 12,
    color: colors.critical,
  },
  versionText: {
    fontFamily: fonts.inter.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.3,
  },
});
