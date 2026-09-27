import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationService, type LocationState } from '../../services/LocationService';
import { HealthService, type WatchConnection } from '../../services/HealthService';
import { EmergencyContactService } from '../../services/EmergencyContactService';
import type { Profile } from '../authentication/store/authStore';
import type { OnboardingStepKey } from '../../types';

// Development builds only: the simulator has no watch, so the watch step
// offers a skip that is remembered here. Ignored in production builds.
export const DEV_SKIP_WATCH_KEY = 'haven.devSkipWatch';

export interface ReadinessResult {
  location: LocationState;
  watch: WatchConnection;
  /** watch.state === 'connected', or waived in a development build */
  watchOk: boolean;
  hasContact: boolean;
  /** Patient has never finished onboarding (profiles.onboarded_at is null) */
  firstTime: boolean;
}

async function devWatchWaived(watch: WatchConnection): Promise<boolean> {
  if (!__DEV__) return false;
  // Expo Go has no HealthKit at all — nothing to verify.
  if (watch.state === 'unavailable') return true;
  return (await AsyncStorage.getItem(DEV_SKIP_WATCH_KEY)) === '1';
}

/**
 * Checks everything onboarding sets up against the device's current state.
 * Onboarding is shown once; after that a step only comes back when what it
 * set up is lost — location turned off, or the watch stops delivering data.
 */
export async function checkReadiness(userId: string, profile: Profile): Promise<ReadinessResult> {
  const [location, watch, contactCount] = await Promise.all([
    LocationService.getStatus().catch((): LocationState => ({ state: 'undetermined' })),
    HealthService.getWatchConnection(),
    // A failed lookup (e.g. offline) must not trap the patient on a step
    // they can't complete without a connection either.
    EmergencyContactService.count(userId).catch(() => 1),
  ]);

  return {
    location,
    watch,
    watchOk: watch.state === 'connected' || (await devWatchWaived(watch)),
    hasContact: contactCount > 0,
    firstTime: !profile.onboarded_at,
  };
}

/** Steps to show, in order. Empty = the patient can use the app. */
export function requiredSteps(result: ReadinessResult, forceFull = false): OnboardingStepKey[] {
  const full = result.firstTime || forceFull;
  const steps: OnboardingStepKey[] = [];
  if (full) steps.push('welcome');
  if (!result.watchOk || forceFull) steps.push('watch');
  if (result.location.state !== 'ok' || forceFull) steps.push('location');
  if (full) steps.push('notifications');
  if (!result.hasContact) steps.push('contact');
  return steps;
}
