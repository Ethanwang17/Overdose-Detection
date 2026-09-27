import { useEffect, useRef } from 'react';
import { useBiometricStore } from '../../biometrics/store/biometricStore';
import { useAuthStore } from '../../authentication/store/authStore';
import { AlertService } from '../../../services/AlertService';
import type { BiometricStatus } from '../../../types';

function buildDetail(): string {
  const { reading } = useBiometricStore.getState();
  if (!reading) return 'Abnormal vitals detected';
  return `HR ${reading.heartRate} · SpO₂ ${reading.spo2}% · RR ${reading.respiratoryRate}/min`;
}

/**
 * Watches biometric status transitions and records them as alert rows.
 * Fires on any source of change — demo sheet, simulator, or HealthKit —
 * because all of them write status into the biometric store. Transition-
 * based, so repeated readings at the same status never duplicate alerts.
 * Returning to normal resolves the open alerts.
 */
export function useAlertSync(enabled: boolean) {
  const userId = useAuthStore((s) => s.session?.user.id);
  const prevStatusRef = useRef<BiometricStatus | null>(null);

  useEffect(() => {
    if (!enabled || !userId) return;

    prevStatusRef.current = useBiometricStore.getState().status;

    const unsub = useBiometricStore.subscribe((state) => {
      const prev = prevStatusRef.current;
      const next = state.status;
      if (next === prev) return;
      prevStatusRef.current = next;

      if (next === 'elevated' || next === 'critical') {
        AlertService.create(userId, next, buildDetail(), state.reading?.source ?? 'unknown').catch(() => {});
      } else if (next === 'normal' && (prev === 'elevated' || prev === 'critical')) {
        AlertService.resolveOpen(userId, 'Vitals returned to normal').catch(() => {});
      }
    });
    return unsub;
  }, [enabled, userId]);
}
