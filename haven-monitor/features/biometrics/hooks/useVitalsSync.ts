import { useEffect } from 'react';
import { useBiometricStore } from '../store/biometricStore';
import { useAuthStore } from '../../authentication/store/authStore';
import { VitalsService } from '../../../services/VitalsService';
import { VITALS_HEARTBEAT_MS } from '../../../constants';

/**
 * Pushes the patient's reading to Supabase the moment it changes (new
 * HealthKit sample, demo switch), so the officer sees it without waiting on
 * a timer. A heartbeat re-sends the current reading so the officer can tell
 * the app is still running; each row's sampled_at says whether the value
 * itself is fresh.
 */
export function useVitalsSync(enabled: boolean) {
  const userId = useAuthStore((s) => s.session?.user.id);

  useEffect(() => {
    if (!enabled || !userId) return;

    const push = () => {
      const { reading, status } = useBiometricStore.getState();
      if (!reading) return;
      // A demo reading is "live" for as long as the demo runs.
      const sample = reading.source === 'demo' ? { ...reading, timestamp: new Date() } : reading;
      VitalsService.push(userId, sample, status).catch(() => {});
    };

    push();
    const unsub = useBiometricStore.subscribe((state, prev) => {
      if (state.reading !== prev.reading || state.status !== prev.status) push();
    });
    const heartbeat = setInterval(push, VITALS_HEARTBEAT_MS);

    return () => {
      unsub();
      clearInterval(heartbeat);
    };
  }, [enabled, userId]);
}
