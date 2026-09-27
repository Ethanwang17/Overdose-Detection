import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AppState,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, FontSize, FontWeight } from '../../../theme/colors';
import { ONBOARDING_COPY } from '../../../constants';
import { LocationService, type LocationState } from '../../../services/LocationService';
import { NotificationService } from '../../../services/NotificationService';
import { HealthService, type WatchConnection } from '../../../services/HealthService';
import { EmergencyContactService } from '../../../services/EmergencyContactService';
import { AuthService } from '../../../services/AuthService';
import { useAuthStore } from '../../authentication/store/authStore';
import { DEV_SKIP_WATCH_KEY } from '../readiness';
import type { OnboardingStepKey } from '../../../types';

interface OnboardingScreenProps {
  steps: OnboardingStepKey[];
  /** First-time setup (all steps) vs. re-onboarding after something was lost */
  firstTime: boolean;
  userId: string;
  /** Re-checks readiness once the last step is done; resolves with what's still missing */
  onFinished: () => Promise<OnboardingStepKey[]>;
}

function minutesAgo(date: Date | null): string {
  if (!date) return 'a while ago';
  const mins = Math.round((Date.now() - date.getTime()) / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hr${hours === 1 ? '' : 's'} ago`;
}

export default function OnboardingScreen({ steps, firstTime, userId, onFinished }: OnboardingScreenProps) {
  const setProfile = useAuthStore((s) => s.setProfile);
  // Fixed for the run: background re-checks mustn't reshuffle steps under
  // the patient. Each step verifies its own outcome before advancing.
  const [flow, setFlow] = useState(steps);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [watch, setWatch] = useState<WatchConnection | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [healthRequested, setHealthRequested] = useState(!firstTime);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);
  // iOS permission alerts briefly background the app; the foreground
  // listener below must not act while a request is already in progress.
  const busyRef = useRef(false);
  busyRef.current = busy;

  const step = flow[Math.min(stepIndex, flow.length - 1)];
  const isLast = stepIndex >= flow.length - 1;

  // A step can be completed from two places at once (its button and the
  // back-from-Settings re-check); only the first transition counts.
  const transitioning = useRef(false);

  const goTo = (index: number) => {
    if (transitioning.current) return;
    transitioning.current = true;
    Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setStepIndex(index);
      setNote(null);
      transitioning.current = false;
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const finish = async () => {
    if (transitioning.current) return;
    transitioning.current = true;
    setBusy(true);
    try {
      if (firstTime) setProfile(await AuthService.markOnboarded(userId));
      const remaining = await onFinished();
      // Normally the shell takes over here. If something was lost again in
      // the meantime, start over on what's still missing.
      if (mounted.current && remaining.length) {
        setFlow(remaining);
        setStepIndex(0);
        setBusy(false);
      }
    } catch {
      if (!mounted.current) return;
      setNote("Couldn't save your setup. Check your connection and try again.");
      setBusy(false);
    } finally {
      transitioning.current = false;
    }
  };

  const advance = () => {
    if (isLast) finish();
    else goTo(stepIndex + 1);
  };

  // ── Watch ──────────────────────────────────────────────────────────────

  const checkWatch = useCallback(async () => {
    const connection = await HealthService.getWatchConnection();
    if (!mounted.current) return connection;
    setWatch(connection);
    if (connection.state === 'stale') {
      setNote(
        `Last reading from your watch was ${minutesAgo(connection.lastSampleAt)}. Make sure it's on your wrist and unlocked, then open the Heart Rate app on the watch to take a new reading.`
      );
    } else if (connection.state === 'no_data') {
      setNote(
        "No heart-rate data from your watch yet. Wear your Apple Watch, check that Haven is allowed in Settings › Health › Data Access & Devices, then open the Heart Rate app on the watch."
      );
    } else {
      setNote(null);
    }
    return connection;
  }, []);

  const handleWatch = async () => {
    if (watch?.state === 'connected') return advance();
    if (!HealthService.isAvailable()) {
      if (__DEV__) return advance(); // Expo Go: nothing to verify
      setNote("This iPhone can't share Apple Health data, which Haven needs. Contact your parole officer.");
      return;
    }
    setBusy(true);
    try {
      if (!healthRequested) {
        await HealthService.requestPermissions();
        setHealthRequested(true);
      }
      await checkWatch();
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  const skipWatchForDev = async () => {
    await AsyncStorage.setItem(DEV_SKIP_WATCH_KEY, '1');
    advance();
  };

  // ── Location ───────────────────────────────────────────────────────────

  const refreshLocation = useCallback(async () => {
    const status = await LocationService.getStatus();
    if (mounted.current) setLocation(status);
    return status;
  }, []);

  const handleLocation = async () => {
    setBusy(true);
    let status: LocationState | null = null;
    try {
      status = await refreshLocation();
      if (status.state === 'undetermined' || (status.state === 'denied' && status.canAskAgain)) {
        await LocationService.requestPermissions();
        status = await refreshLocation();
      }
    } catch {
      status = null;
    }
    if (!mounted.current) return;
    setBusy(false);

    if (status?.state === 'ok') return advance();
    if (status?.state === 'services_off') {
      setNote('Location Services is off on this iPhone. Turn it on in Settings › Privacy & Security › Location Services.');
    } else {
      setNote('Location for Haven is off. In Settings, set Location to "While Using the App".');
    }
    Linking.openSettings();
  };

  // ── Notifications / contact ────────────────────────────────────────────

  const handleNotifications = async () => {
    setBusy(true);
    try {
      await NotificationService.requestPermissions();
    } catch {
      // optional step — carry on either way
    }
    if (!mounted.current) return;
    setBusy(false);
    advance();
  };

  const handleContact = async () => {
    setBusy(true);
    let done = false;
    try {
      const picked = await EmergencyContactService.pickContact();
      // null = picker cancelled — stay on this step
      if (picked) {
        await EmergencyContactService.add(userId, picked);
        done = true;
      }
    } catch (err) {
      // A contact may already exist (e.g. added by the officer meanwhile)
      done = (await EmergencyContactService.count(userId).catch(() => 0)) > 0;
      if (!done) setNote(err instanceof Error ? err.message : 'Could not add that contact. Please try again.');
    }
    if (!mounted.current) return;
    setBusy(false);
    if (done) advance();
  };

  // Step entry: learn the current state without prompting. Re-onboarding
  // checks the watch right away — it may already be back on the wrist.
  useEffect(() => {
    if (step === 'location') refreshLocation().catch(() => {});
    if (step === 'watch' && !firstTime && HealthService.isAvailable()) checkWatch().catch(() => {});
  }, [step, firstTime, refreshLocation, checkWatch]);

  // Back from Settings / the Watch: re-check and move on if it's fixed.
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active' || busyRef.current) return;
      if (step === 'location') {
        const status = await refreshLocation().catch(() => null);
        if (status?.state === 'ok') advance();
      } else if (step === 'watch' && healthRequested && HealthService.isAvailable()) {
        await checkWatch().catch(() => null);
      }
    });
    return () => sub.remove();
  });

  // ── Render ─────────────────────────────────────────────────────────────

  let title = '';
  let body = '';
  let cta = 'Continue';
  let onPress = advance;
  let status: string | null = null;
  let secondary: { label: string; onPress: () => void } | null = null;

  switch (step) {
    case 'welcome':
      cta = 'Get Started';
      break;
    case 'watch': {
      const copy = ONBOARDING_COPY.watch;
      title = firstTime ? copy.title : copy.repairTitle;
      body = firstTime ? copy.body : copy.repairBody;
      onPress = handleWatch;
      if (watch?.state === 'connected') {
        status = `✓ Receiving data from ${watch.sourceName ?? 'your watch'}${watch.manual ? ' (manual entry, dev build)' : ''}`;
        cta = 'Continue';
      } else {
        cta = healthRequested ? 'Check Again' : 'Allow Health Access';
        if (__DEV__) secondary = { label: 'Continue without a watch (dev build)', onPress: skipWatchForDev };
      }
      break;
    }
    case 'location': {
      const copy = ONBOARDING_COPY.location;
      title = firstTime ? copy.title : copy.repairTitle;
      body = firstTime ? copy.body : copy.repairBody;
      onPress = handleLocation;
      const needsSettings =
        location?.state === 'services_off' || (location?.state === 'denied' && !location.canAskAgain);
      cta = location?.state === 'ok' ? 'Continue' : needsSettings ? 'Open Settings' : 'Allow Location';
      break;
    }
    case 'notifications':
      title = ONBOARDING_COPY.notifications.title;
      body = ONBOARDING_COPY.notifications.body;
      cta = 'Allow Notifications';
      onPress = handleNotifications;
      secondary = { label: 'Not now', onPress: advance };
      break;
    case 'contact':
      title = ONBOARDING_COPY.contact.title;
      body = ONBOARDING_COPY.contact.body;
      cta = 'Choose Contact';
      onPress = handleContact;
      break;
  }

  const numbered = flow.filter((s) => s !== 'welcome');
  const counter = firstTime
    ? `STEP ${numbered.findIndex((s) => s === step) + 1} OF ${numbered.length}`
    : 'ACTION NEEDED';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <View style={styles.dotsRow}>
          {flow.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === stepIndex ? styles.dotCurrent : idx < stepIndex ? styles.dotDone : styles.dotFuture,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={() => AuthService.signOut()} activeOpacity={0.6} hitSlop={10}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
        {step === 'welcome' ? (
          <View>
            <View style={styles.greenDot} />
            <Text style={styles.welcomeTitle}>{ONBOARDING_COPY.welcome.title}</Text>
            <Text style={styles.welcomeTagline}>{ONBOARDING_COPY.welcome.body}</Text>
          </View>
        ) : (
          <View>
            <Text style={[styles.stepCounter, !firstTime && styles.stepCounterAlert]}>{counter}</Text>
            <Text style={styles.stepTitle}>{title}</Text>
            <Text style={styles.stepBody}>{body}</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.bottomArea}>
        {!!status && <Text style={styles.statusText}>{status}</Text>}
        {!!note && <Text style={styles.note}>{note}</Text>}

        <TouchableOpacity
          style={[styles.ctaButton, busy && styles.ctaButtonBusy]}
          onPress={onPress}
          activeOpacity={0.85}
          disabled={busy}
        >
          <Text style={styles.ctaText}>{busy ? 'One moment…' : cta}</Text>
        </TouchableOpacity>

        {secondary ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={secondary.onPress} activeOpacity={0.6} disabled={busy}>
            <Text style={styles.secondaryText}>{secondary.label}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.secondaryButton} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screen,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotCurrent: {
    width: 24,
    backgroundColor: Colors.ink,
  },
  dotDone: {
    width: 6,
    backgroundColor: Colors.ink,
  },
  dotFuture: {
    width: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },

  contentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.huge,
  },

  greenDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.green,
    marginBottom: 26,
  },
  welcomeTitle: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -1.5,
    lineHeight: FontSize.hero * 1.05,
  },
  welcomeTagline: {
    fontSize: FontSize.heading4,
    color: Colors.textSecondary,
    lineHeight: 28,
    marginTop: 18,
    maxWidth: 300,
  },

  stepCounter: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.4,
    color: '#A0A0A6',
  },
  stepCounterAlert: {
    color: Colors.amberDark,
  },
  stepTitle: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
    marginTop: 16,
    lineHeight: FontSize.heading1 * 1.1,
  },
  stepBody: {
    fontSize: FontSize.xxl,
    color: Colors.textSecondary,
    lineHeight: 28,
    marginTop: 16,
  },

  bottomArea: {
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.greenDark,
    textAlign: 'center',
  },
  note: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.xs,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonBusy: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },
});
