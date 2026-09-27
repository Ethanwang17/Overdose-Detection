import { create } from 'zustand';
import { checkReadiness, requiredSteps, type ReadinessResult } from '../readiness';
import type { Profile } from '../../authentication/store/authStore';
import type { OnboardingStepKey } from '../../../types';

interface ReadinessState {
  /** null until the first check completes — the patient shell waits on it */
  result: ReadinessResult | null;
  steps: OnboardingStepKey[];
  /** Development builds: "Restart Onboarding" in the Demo sheet */
  forcedFull: boolean;
  refresh: (userId: string, profile: Profile) => Promise<OnboardingStepKey[]>;
  forceFullOnboarding: () => void;
  clearForced: () => void;
  reset: () => void;
}

// Foreground, interval and post-onboarding checks can overlap; callers with
// the same profile state share one check. A check for a newer profile state
// (e.g. right after onboarded_at is stamped) queues behind the current one
// so its result lands last.
let inFlight: { key: string; promise: Promise<OnboardingStepKey[]> } | null = null;

export const useReadinessStore = create<ReadinessState>((set, get) => ({
  result: null,
  steps: [],
  forcedFull: false,

  refresh: (userId, profile) => {
    const key = `${userId}:${profile.onboarded_at ?? ''}`;
    if (inFlight?.key === key) return inFlight.promise;

    const prior = inFlight?.promise ?? Promise.resolve([]);
    const promise: Promise<OnboardingStepKey[]> = prior
      .catch(() => [])
      .then(() => checkReadiness(userId, profile))
      .then((result) => {
        const steps = requiredSteps(result, get().forcedFull);
        set({ result, steps });
        return steps;
      })
      .finally(() => {
        if (inFlight?.promise === promise) inFlight = null;
      });
    inFlight = { key, promise };
    return promise;
  },

  forceFullOnboarding: () => {
    const { result } = get();
    set({ forcedFull: true, steps: result ? requiredSteps(result, true) : get().steps });
  },

  clearForced: () => set({ forcedFull: false }),

  reset: () => set({ result: null, steps: [], forcedFull: false }),
}));
