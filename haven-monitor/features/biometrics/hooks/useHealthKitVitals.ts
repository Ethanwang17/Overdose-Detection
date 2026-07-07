import { useEffect, useRef } from 'react';
import { HealthService } from '../../../services/HealthService';
import { useBiometricStore } from '../store/biometricStore';
import { classifyVitals } from '../classifyVitals';
import { HEALTHKIT_POLL_INTERVAL_MS } from '../../../constants';
import type { BiometricStatus } from '../../../types';

/**
 * Feeds real HealthKit samples into the biometric store, replacing the
 * demo values as the display source. No-ops when HealthKit is unavailable
 * (Expo Go, Android) and defers to the Demo sheet while demo mode or an
 * emergency is active. useVitalsSync picks the store values up from here,
 * so real readings flow to Supabase unchanged.
 */
export function useHealthKitVitals(enabled: boolean) {
  const prevStatusRef = useRef<BiometricStatus>('normal');

  useEffect(() => {
    if (!enabled || !HealthService.isAvailable()) return;
    let cancelled = false;

    const poll = async () => {
      const snapshot = await HealthService.getLatestVitals();
      if (cancelled || !snapshot) return;

      const store = useBiometricStore.getState();
      // Demo mode and an active emergency own the display; also hold the
      // last shown values when the lookback window has no samples.
      if (store.demoActive || store.emergency) return;
      if (!snapshot.latestSampleAt) return;

      const status = classifyVitals(snapshot.heartRate, snapshot.spo2, snapshot.respiratoryRate);
      const prev = store.reading;
      store.setReading({
        // Carry the previous value forward for metrics without a fresh
        // sample (e.g. respiratory rate only records during sleep).
        heartRate: snapshot.heartRate ?? prev?.heartRate ?? 0,
        spo2: snapshot.spo2 ?? prev?.spo2 ?? 0,
        respiratoryRate: snapshot.respiratoryRate ?? prev?.respiratoryRate ?? 0,
        movement: prev?.movement ?? 0,
        timestamp: snapshot.latestSampleAt,
        batteryLevel: store.batteryLevel,
        connectionQuality: store.connectionQuality,
      });
      store.setStatus(status);

      if (status === 'critical' && prevStatusRef.current !== 'critical') {
        store.startEmergency();
      }
      prevStatusRef.current = status;
    };

    poll();
    const timer = setInterval(poll, HEALTHKIT_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled]);
}
