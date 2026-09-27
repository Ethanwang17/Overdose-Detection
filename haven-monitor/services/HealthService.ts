import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WATCH_STALE_MINUTES } from '../constants';

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
  // 'manual' when the newest heart-rate value was typed into the Health app
  // (only possible in development builds — see isTrusted).
  source: 'healthkit' | 'manual';
}

export type WatchConnectionState = 'connected' | 'stale' | 'no_data' | 'unavailable';

export interface WatchConnection {
  state: WatchConnectionState;
  lastSampleAt: Date | null;
  // HealthKit source of the newest sample, e.g. "Alex's Apple Watch"
  sourceName: string | null;
  manual: boolean;
}

interface HealthSample {
  value: number;
  startDate: string;
  endDate: string;
  sourceName?: string;
  sourceId?: string;
  metadata?: Record<string, unknown> | null;
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

// The first initHealthKit call shows the permission sheet. Background
// checks (readiness, live polling) must not trigger it before onboarding
// has explained why, so they only query once onboarding has asked. iOS
// drops Health permissions when the app is deleted, as does this flag.
const REQUESTED_KEY = 'haven.healthRequested';
let requestedCache: boolean | null = null;

async function hasRequestedAccess(): Promise<boolean> {
  if (requestedCache === null) {
    requestedCache = (await AsyncStorage.getItem(REQUESTED_KEY)) === '1';
  }
  return requestedCache;
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

function isUserEntered(sample: HealthSample): boolean {
  const flag = sample.metadata?.HKWasUserEntered;
  return flag === 1 || flag === true;
}

// Values typed into the Health app aren't measurements — a patient could
// enter normal vitals to mask a real reading. Production builds ignore
// them; development builds accept them (tagged 'manual') so the flow can
// be exercised in the simulator, which has no watch.
function isTrusted(sample: HealthSample): boolean {
  return __DEV__ || !isUserEntered(sample);
}

function fetchRecentSamples(method: string, startDate: string, limit = 20): Promise<HealthSample[]> {
  return new Promise((resolve) => {
    const native = NativeModules.AppleHealthKit;
    if (typeof native?.[method] !== 'function') return resolve([]);
    native[method](
      { startDate, ascending: false, limit },
      (err: string, results: HealthSample[]) => {
        resolve(!err && results?.length ? results : []);
      }
    );
  });
}

async function fetchLatestTrusted(method: string, startDate: string): Promise<HealthSample | null> {
  const samples = await fetchRecentSamples(method, startDate);
  return samples.find(isTrusted) ?? null;
}

export const HealthService = {
  isAvailable(): boolean {
    return Platform.OS === 'ios' && !!NativeModules.AppleHealthKit;
  },

  /**
   * Show the HealthKit permission sheet for the vitals Haven reads.
   * Note: iOS never reveals whether READ access was denied — 'granted'
   * means the request completed, not that the user enabled every toggle.
   * The only real signal is whether sample queries return data, which is
   * what getWatchConnection checks.
   */
  async requestPermissions(): Promise<HealthAccessResult> {
    if (!HealthService.isAvailable()) return 'unavailable';
    const ok = await initOnce();
    requestedCache = true;
    await AsyncStorage.setItem(REQUESTED_KEY, '1');
    return ok ? 'granted' : 'denied';
  },

  /**
   * Most recent trusted sample per metric within the lookback window.
   * Metrics with no samples (or hidden by a read denial, which iOS reports
   * as empty results) come back null.
   */
  async getLatestVitals(lookbackMinutes = 240): Promise<HealthVitalsSnapshot | null> {
    if (!HealthService.isAvailable() || !(await hasRequestedAccess())) return null;
    if (!(await initOnce())) return null;

    const startDate = new Date(Date.now() - lookbackMinutes * 60_000).toISOString();
    const [hr, oxygen, rr] = await Promise.all([
      fetchLatestTrusted('getHeartRateSamples', startDate),
      fetchLatestTrusted('getOxygenSaturationSamples', startDate),
      fetchLatestTrusted('getRespiratoryRateSamples', startDate),
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
      source: hr && isUserEntered(hr) ? 'manual' : 'healthkit',
    };
  },

  /**
   * Whether the watch is actually delivering data: the newest trusted
   * heart-rate sample within the last day, judged against
   * WATCH_STALE_MINUTES. Heart rate is the signal because the watch
   * records it every few minutes while worn; SpO₂ and respiratory rate
   * are too sparse to tell "disconnected" from "not measured yet".
   */
  async getWatchConnection(): Promise<WatchConnection> {
    if (!HealthService.isAvailable()) {
      return { state: 'unavailable', lastSampleAt: null, sourceName: null, manual: false };
    }
    // Never asked yet: report no data rather than popping the sheet here.
    if (!(await hasRequestedAccess()) || !(await initOnce())) {
      return { state: 'no_data', lastSampleAt: null, sourceName: null, manual: false };
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const latest = await fetchLatestTrusted('getHeartRateSamples', dayAgo);
    if (!latest) {
      return { state: 'no_data', lastSampleAt: null, sourceName: null, manual: false };
    }

    const lastSampleAt = new Date(latest.endDate);
    const ageMinutes = (Date.now() - lastSampleAt.getTime()) / 60_000;
    return {
      state: ageMinutes <= WATCH_STALE_MINUTES ? 'connected' : 'stale',
      lastSampleAt,
      sourceName: latest.sourceName ?? null,
      manual: isUserEntered(latest),
    };
  },
};
