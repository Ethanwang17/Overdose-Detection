import { NativeModules, Platform } from 'react-native';

// react-native-health only exists in a custom dev/production build
// (npx expo run:ios). In Expo Go the native module is absent, and on
// Android there is no HealthKit — both report 'unavailable' rather than
// pretending access was granted.
export type HealthAccessResult = 'granted' | 'denied' | 'unavailable';

export interface HealthVitalsSnapshot {
  heartRate: number | null;
  spo2: number | null;
  respiratoryRate: number | null;
  // Newest sample time across the three metrics; null when no samples
  // exist in the lookback window.
  latestSampleAt: Date | null;
}

interface HealthSample {
  value: number;
  startDate: string;
  endDate: string;
}

// Call the native module directly: react-native-health wraps it with
// Object.assign, which loses TurboModule interop methods under the new
// architecture. Permission names fall back to the documented strings.
function getPermissionOptions() {
  let perms: Record<string, string> | undefined;
  try {
    const healthModule = require('react-native-health');
    perms = (healthModule.Constants ?? healthModule.default?.Constants)?.Permissions;
  } catch {
    // fall through to string names
  }
  return {
    permissions: {
      read: [
        perms?.HeartRate ?? 'HeartRate',
        perms?.OxygenSaturation ?? 'OxygenSaturation',
        perms?.RespiratoryRate ?? 'RespiratoryRate',
      ],
      write: [],
    },
  };
}

// initHealthKit must run once per app launch before any sample query.
// Cache the in-flight promise; reset on failure so a retry is possible.
let initPromise: Promise<boolean> | null = null;

function initOnce(): Promise<boolean> {
  if (!initPromise) {
    initPromise = new Promise<boolean>((resolve) => {
      NativeModules.AppleHealthKit.initHealthKit(getPermissionOptions(), (error: string) => {
        resolve(!error);
      });
    }).then((ok) => {
      if (!ok) initPromise = null;
      return ok;
    });
  }
  return initPromise;
}

function fetchLatestSample(method: string, startDate: string): Promise<HealthSample | null> {
  return new Promise((resolve) => {
    const native = NativeModules.AppleHealthKit;
    if (typeof native?.[method] !== 'function') return resolve(null);
    native[method](
      { startDate, ascending: false, limit: 1 },
      (err: string, results: HealthSample[]) => {
        resolve(!err && results?.length ? results[0] : null);
      }
    );
  });
}

export const HealthService = {
  isAvailable(): boolean {
    return Platform.OS === 'ios' && !!NativeModules.AppleHealthKit;
  },

  /**
   * Show the HealthKit permission sheet for the vitals Haven reads.
   * Note: iOS never reveals whether READ access was denied — 'granted'
   * means the request completed, not that the user enabled every toggle.
   * The only real signal is whether sample queries return data.
   */
  async requestPermissions(): Promise<HealthAccessResult> {
    if (!HealthService.isAvailable()) return 'unavailable';
    const ok = await initOnce();
    return ok ? 'granted' : 'denied';
  },

  /**
   * Most recent sample per metric within the lookback window. Metrics
   * with no samples (or hidden by a read denial, which iOS reports as
   * empty results) come back null.
   */
  async getLatestVitals(lookbackMinutes = 240): Promise<HealthVitalsSnapshot | null> {
    if (!HealthService.isAvailable()) return null;
    if (!(await initOnce())) return null;

    const startDate = new Date(Date.now() - lookbackMinutes * 60_000).toISOString();
    const [hr, oxygen, rr] = await Promise.all([
      fetchLatestSample('getHeartRateSamples', startDate),
      fetchLatestSample('getOxygenSaturationSamples', startDate),
      fetchLatestSample('getRespiratoryRateSamples', startDate),
    ]);

    const sampleDates = [hr, oxygen, rr]
      .filter((s): s is HealthSample => s !== null)
      .map((s) => new Date(s.endDate).getTime());

    return {
      heartRate: hr ? Math.round(hr.value) : null,
      // HealthKit stores oxygen saturation as a 0–1 fraction
      spo2: oxygen ? Math.round(oxygen.value <= 1 ? oxygen.value * 100 : oxygen.value) : null,
      respiratoryRate: rr ? Math.round(rr.value) : null,
      latestSampleAt: sampleDates.length ? new Date(Math.max(...sampleDates)) : null,
    };
  },
};
