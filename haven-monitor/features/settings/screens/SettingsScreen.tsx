import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AppState,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';
import { AuthService } from '../../../services/AuthService';
import { NotificationService } from '../../../services/NotificationService';
import { supabase } from '../../../lib/supabase';
import { CopyIcon, CheckIcon } from '../../../shared/components/CopyIcons';
import { useAuthStore } from '../../authentication/store/authStore';
import { useReadinessStore } from '../../onboarding/store/readinessStore';

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
    disabled={!onPress}
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

  const { clear, session, profile } = useAuthStore();
  const isOfficer = profile?.role === 'parole_officer';

  // Officer invite code: metadata is a fast first guess, but the
  // parole_officers row is authoritative (pre-existing officers have no
  // invite_code in their auth metadata).
  const [inviteCode, setInviteCode] = useState<string | null>(
    (session?.user.user_metadata?.invite_code as string | undefined) ?? null
  );
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOfficer || !session?.user.id) return;
    let cancelled = false;
    supabase
      .from('parole_officers')
      .select('invite_code')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data?.invite_code) setInviteCode(data.invite_code);
      });
    return () => { cancelled = true; };
  }, [isOfficer, session?.user.id]);

  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current); }, []);

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  // Officer: alerts arrive as notifications, so surface whether they're on.
  // (Officers skip onboarding, where patients are asked.)
  const [notificationsOn, setNotificationsOn] = useState<boolean | null>(null);
  const refreshNotifications = useCallback(() => {
    Notifications.getPermissionsAsync()
      .then(({ status }) => setNotificationsOn(status === 'granted'))
      .catch(() => setNotificationsOn(null));
  }, []);
  useEffect(() => {
    if (!isOfficer) return;
    refreshNotifications();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') refreshNotifications(); });
    return () => sub.remove();
  }, [isOfficer, refreshNotifications]);

  const handleNotifications = async () => {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status !== 'granted' && canAskAgain) {
      await NotificationService.requestPermissions();
      refreshNotifications();
    } else {
      Linking.openSettings();
    }
  };

  // Patient: watch status from the latest readiness check
  const watch = useReadinessStore((s) => s.result?.watch);
  const watchValue =
    watch?.state === 'connected' ? 'Connected'
      : watch?.state === 'unavailable' ? 'Unavailable'
      : watch ? 'Not reporting' : undefined;
  const watchColor = watch?.state === 'connected' ? Colors.green : Colors.amberDark;

  const handleSignOut = async () => {
    await AuthService.signOut();
    clear();
    router.replace('/(auth)/login');
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

        {/* ── YOUR INVITE CODE (officers only) ── */}
        {isOfficer && (
          <View style={[styles.section, styles.firstSection]}>
            <SectionHeader label="YOUR INVITE CODE" />
            <SettingCard>
              <TouchableOpacity
                style={styles.inviteRow}
                onPress={handleCopyInviteCode}
                activeOpacity={0.6}
              >
                <View style={styles.inviteTextWrap}>
                  <Text style={styles.inviteCode}>{inviteCode ?? '——'}</Text>
                  <Text style={[styles.inviteHint, copied && styles.inviteHintCopied]}>
                    {copied ? 'Copied to clipboard' : 'Share with patients to link them to you'}
                  </Text>
                </View>
                {copied
                  ? <CheckIcon color={Colors.green} />
                  : <CopyIcon color={Colors.textTertiary} />}
              </TouchableOpacity>
            </SettingCard>
          </View>
        )}

        {/* Patients: only reconnecting their watch and changing their
            password. Emergency contacts and the officer link are managed by
            the officer; monitoring behavior isn't the patient's to change. */}
        {!isOfficer && (
          <View style={[styles.section, styles.firstSection]}>
            <SectionHeader label="APPLE WATCH" />
            <SettingCard>
              <SettingRow
                label="Reconnect Apple Watch"
                value={watchValue}
                valueColor={watchColor}
                onPress={() => router.push('/settings/device')}
                isLast
              />
            </SettingCard>
          </View>
        )}

        {/* ── ALERTS (officers) ── */}
        {isOfficer && (
          <View style={styles.section}>
            <SectionHeader label="ALERTS" />
            <SettingCard>
              <SettingRow
                label="Alert Notifications"
                value={notificationsOn === null ? undefined : notificationsOn ? 'On' : 'Off'}
                valueColor={notificationsOn ? Colors.green : Colors.amberDark}
                onPress={handleNotifications}
                isLast
              />
            </SettingCard>
          </View>
        )}

        {/* ── ACCOUNT ── */}
        <View style={styles.section}>
          <SectionHeader label="ACCOUNT" />
          <SettingCard>
            <SettingRow
              label={profile?.email ?? session?.user.email ?? ''}
              showChevron={false}
            />
            <Divider />
            <SettingRow
              label="Change Password"
              onPress={() => router.push('/settings/password')}
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

  // Invite code (officers)
  inviteRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
  },
  inviteTextWrap: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  inviteCode: {
    fontSize: FontSize.heading3,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: 2,
  },
  inviteHint: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 3,
  },
  inviteHintCopied: {
    color: Colors.green,
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
