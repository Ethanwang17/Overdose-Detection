import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useReadinessStore } from '../store/readinessStore';
import { DeviceStatusService } from '../../../services/DeviceStatusService';
import { READINESS_RECHECK_MS } from '../../../constants';
import type { Profile } from '../../authentication/store/authStore';
import type { ReadinessResult } from '../readiness';

function reportDeviceStatus(userId: string, r: ReadinessResult) {
  // Report the raw state, not development waivers — the officer should see
  // "watch not reporting" even when a dev build skipped the watch step.
  DeviceStatusService.report(userId, {
    location_ok: r.location.state === 'ok',
    location_issue: r.location.state === 'ok' ? null : r.location.state,
    watch_ok: r.watch.state === 'connected',
    watch_issue: r.watch.state === 'connected' ? null : r.watch.state,
    watch_name: r.watch.sourceName,
    last_watch_sample_at: r.watch.lastSampleAt?.toISOString() ?? null,
  }).catch(() => {});
}

/**
 * Patient only: re-checks watch, location and emergency contact on launch,
 * whenever the app returns to the foreground (e.g. back from Settings), and
 * every few minutes while open. A lost item sends the patient back into
 * onboarding for just that step, and is reported to their officer.
 */
export function useReadinessMonitor(enabled: boolean, userId: string | undefined, profile: Profile | null) {
  const refresh = useReadinessStore((s) => s.refresh);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    if (!enabled || !userId || !profileRef.current) return;

    const run = () => {
      const current = profileRef.current;
      if (!current) return;
      refresh(userId, current)
        .then(() => {
          const { result } = useReadinessStore.getState();
          if (result) reportDeviceStatus(userId, result);
        })
        .catch(() => {});
    };

    run();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    const timer = setInterval(run, READINESS_RECHECK_MS);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [enabled, userId, profile?.onboarded_at, refresh]);
}
