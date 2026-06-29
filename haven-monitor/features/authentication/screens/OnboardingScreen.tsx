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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = ONBOARDING_STEPS.length; // 6 (indices 0–5)

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
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

  const handleCTA = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      animateTransition(currentStep + 1);
    } else {
      router.replace('/(app)');
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      animateTransition(currentStep + 1);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

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
        <TouchableOpacity style={styles.ctaButton} onPress={handleCTA} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{step.cta}</Text>
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
  ctaButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
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
