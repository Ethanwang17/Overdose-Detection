import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';

// ── Helper Components ────────────────────────────────────────────────────────

interface SectionHeaderProps {
  label: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ label }) => (
  <Text style={styles.sectionHeader}>{label}</Text>
);

interface DividerProps {}

const Divider: React.FC<DividerProps> = () => <View style={styles.divider} />;

interface SettingRowProps {
  label: string;
  value?: string;
  showChevron?: boolean;
  onPress?: () => void;
  valueColor?: string;
  isLast?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  value,
  showChevron = true,
  onPress,
  valueColor = Colors.textTertiary,
  isLast = false,
}) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.settingRight}>
      {value ? (
        <Text style={[styles.settingValue, { color: valueColor }]}>{value}</Text>
      ) : null}
      {showChevron && (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  </TouchableOpacity>
);

interface SettingCardProps {
  children: React.ReactNode;
}

const SettingCard: React.FC<SettingCardProps> = ({ children }) => (
  <View style={styles.card}>
    <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
    <View style={styles.cardOverlay} />
    {children}
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();

  const handleSignOut = () => {
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>Settings</Text>

        {/* ── DEVICES ── */}
        <View style={[styles.section, styles.firstSection]}>
          <SectionHeader label="DEVICES" />
          <SettingCard>
            <SettingRow
              label="Apple Watch Series 9"
              value="Connected"
              valueColor={Colors.green}
              onPress={() => router.push('/settings/devices')}
            />
            <Divider />
            <SettingRow
              label="Add a Device"
              onPress={() => router.push('/settings/devices')}
              isLast
            />
          </SettingCard>
        </View>

        {/* ── MONITORING ── */}
        <View style={styles.section}>
          <SectionHeader label="MONITORING" />
          <SettingCard>
            <SettingRow
              label="Detection Sensitivity"
              value="Standard"
              onPress={() => {}}
            />
            <Divider />
            <SettingRow
              label="Alert Countdown"
              value="30 seconds"
              onPress={() => {}}
              isLast
            />
          </SettingCard>
        </View>

        {/* ── ALERTS & CONTACTS ── */}
        <View style={styles.section}>
          <SectionHeader label="ALERTS & CONTACTS" />
          <SettingCard>
            <SettingRow
              label="Notifications"
              onPress={() => {}}
            />
            <Divider />
            <SettingRow
              label="Emergency Contacts"
              value="2 people"
              onPress={() => router.push('/settings/emergency-contacts')}
            />
            <Divider />
            <SettingRow
              label="Parole Officer"
              value="Linked"
              onPress={() => {}}
              isLast
            />
          </SettingCard>
        </View>

        {/* ── PRIVACY ── */}
        <View style={styles.section}>
          <SectionHeader label="PRIVACY" />
          <SettingCard>
            <SettingRow
              label="Data & Privacy"
              onPress={() => {}}
            />
            <Divider />
            <SettingRow
              label="Location Sharing"
              value="While monitoring"
              onPress={() => {}}
              isLast
            />
          </SettingCard>
        </View>

        {/* ── ACCOUNT ── */}
        <View style={styles.section}>
          <SectionHeader label="ACCOUNT" />
          <SettingCard>
            <SettingRow
              label="Subscription"
              value="Haven Plus"
              onPress={() => {}}
            />
            <Divider />
            <SettingRow
              label="alex.morgan@email.com"
              onPress={() => {}}
              isLast
            />
          </SettingCard>
        </View>

        {/* ── Sign Out ── */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Haven v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF0F5',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 150,
  },
  pageTitle: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    paddingHorizontal: 24,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    letterSpacing: -0.6,
  },

  // Section
  section: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  firstSection: {
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },

  // Card
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    shadowColor: '#8A90A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },

  // Row
  settingRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  settingLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    color: Colors.ink,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  settingValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.chevron,
    lineHeight: 22,
    marginTop: -1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },

  // Sign Out
  signOutSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  signOutButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
  },
  signOutText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.signOut,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
    marginTop: 14,
  },
});
