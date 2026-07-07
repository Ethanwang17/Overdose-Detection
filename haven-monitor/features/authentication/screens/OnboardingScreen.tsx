import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme/colors';
import { ONBOARDING_STEPS } from '../../../constants';
import { LocationService } from '../../../services/LocationService';
import { NotificationService } from '../../../services/NotificationService';
import { HealthService } from '../../../services/HealthService';
import { EmergencyContactService } from '../../../services/EmergencyContactService';
import { useAuthStore } from '../store/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = ONBOARDING_STEPS.length; // 6 (indices 0–5)

export default function OnboardingScreen() {
  const session = useAuthStore((s) => s.session);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  // Non-blocking notice shown on the following step when a permission was
  // denied (e.g. "Location sharing is off"). Cleared on the next action.
  const [permissionNote, setPermissionNote] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (toStep: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(toStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const step = ONBOARDING_STEPS[currentStep];

  const advance = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      animateTransition(currentStep + 1);
    } else {
      router.replace('/(app)');
    }
  };

  // 'device' has no real SDK behind it yet (see ONBOARDING_STEPS in
  // constants) — its CTA just advances. 'health' requires a custom build;
  // in Expo Go / on Android it reports unavailable instead of pretending.
  const handleCTA = async () => {
    if (isRequesting) return;
    let note: string | null = null;

    if (step.permissionType === 'location' || step.permissionType === 'notifications') {
      setIsRequesting(true);
      try {
        const granted =
          step.permissionType === 'location'
            ? await LocationService.requestPermissions()
            : await NotificationService.requestPermissions();
        if (!granted) {
          note =
            step.permissionType === 'location'
              ? 'Location sharing is off. You can enable it anytime in Settings.'
              : 'Notifications are off. You can enable them anytime in Settings.';
        }
      } catch {
        note = 'Permission request failed. You can try again later in Settings.';
      } finally {
        setIsRequesting(false);
      }
    } else if (step.permissionType === 'health') {
      setIsRequesting(true);
      try {
        const result = await HealthService.requestPermissions();
        if (result === 'unavailable') {
          note = "Health access isn't available in this build yet — it needs the full Haven app.";
        } else if (result === 'denied') {
          note = 'Health access is off. You can enable it anytime in the Health app.';
        }
      } catch {
        note = 'Health access request failed. You can enable it later in the Health app.';
      } finally {
        setIsRequesting(false);
      }
    } else if (step.permissionType === 'contact') {
      setIsRequesting(true);
      try {
        const picked = await EmergencyContactService.pickContact();
        if (!picked) {
          // Picker cancelled — stay on this step so the user can retry or skip.
          setIsRequesting(false);
          return;
        }
        if (session) {
          await EmergencyContactService.add(session.user.id, picked);
        } else {
          await EmergencyContactService.stashPending(picked);
          note = `${picked.name} will be saved once you sign in.`;
        }
      } catch (err) {
        note =
          err instanceof Error
            ? err.message
            : 'Could not add that contact. You can add one later in Settings.';
      } finally {
        setIsRequesting(false);
      }
    }

    setPermissionNote(note);
    advance();
  };

  const handleSkip = () => {
    if (isRequesting) return;
    setPermissionNote(null);
    if (currentStep < TOTAL_STEPS - 1) {
      animateTransition(currentStep + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {ONBOARDING_STEPS.map((_, idx) => {
          const isCurrent = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                isCurrent && styles.dotCurrent,
                isDone && styles.dotDone,
                !isCurrent && !isDone && styles.dotFuture,
              ]}
            />
          );
        })}
      </View>

      {/* Step content */}
      <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
        {step.isWelcome ? (
          /* Step 0: Welcome */
          <View style={styles.welcomeContent}>
            <View style={styles.greenDot} />
            <Text style={styles.welcomeTitle}>Haven</Text>
            <Text style={styles.welcomeTagline}>
              Continuous monitoring that{'\n'}watches over you, quietly.
            </Text>
          </View>
        ) : (
          /* Steps 1–5: Permission steps */
          <View style={styles.stepContent}>
            <Text style={styles.stepCounter}>
              STEP {step.id} OF 5
            </Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepBody}>{step.body}</Text>
          </View>
        )}
      </Animated.View>

      {/* CTA and skip */}
      <View style={styles.bottomArea}>
        {permissionNote && <Text style={styles.permissionNote}>{permissionNote}</Text>}

        <TouchableOpacity
          style={[styles.ctaButton, isRequesting && styles.ctaButtonLoading]}
          onPress={handleCTA}
          activeOpacity={0.85}
          disabled={isRequesting}
        >
          <Text style={styles.ctaText}>{isRequesting ? 'Requesting…' : step.cta}</Text>
        </TouchableOpacity>

        {!step.isWelcome && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.6}>
            <Text style={styles.skipText}>Not now</Text>
          </TouchableOpacity>
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

  /* Progress dots */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotCurrent: {
    width: 24,
    backgroundColor: Colors.ink,
    borderRadius: 3,
  },
  dotDone: {
    width: 6,
    backgroundColor: Colors.ink,
  },
  dotFuture: {
    width: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
  },

  /* Content area */
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.huge,
  },

  /* Welcome step */
  welcomeContent: {
    alignItems: 'flex-start',
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

  /* Permission steps */
  stepContent: {
    alignItems: 'flex-start',
  },
  stepCounter: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.4,
    color: '#A0A0A6',
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

  /* Bottom area */
  bottomArea: {
    paddingBottom: Spacing.huge,
    gap: Spacing.sm,
  },
  permissionNote: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonLoading: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  skipText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },
});
