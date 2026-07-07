import { NativeModules, Platform } from 'react-native';

// react-native-health only exists in a custom dev/production build
// (npx expo run:ios). In Expo Go the native module is absent, and on
// Android there is no HealthKit — both report 'unavailable' rather than
// pretending access was granted.
export type HealthAccessResult = 'granted' | 'denied' | 'unavailable';

export const HealthService = {
  isAvailable(): boolean {
    return Platform.OS === 'ios' && !!NativeModules.AppleHealthKit;
  },

  /**
   * Show the HealthKit permission sheet for the vitals Haven reads.
   * Note: iOS never reveals whether READ access was denied — 'granted'
   * means the request completed, not that the user enabled every toggle.
   */
  async requestPermissions(): Promise<HealthAccessResult> {
    if (!HealthService.isAvailable()) return 'unavailable';

    // Call the native module directly: react-native-health wraps it with
    // Object.assign, which loses TurboModule interop methods under the new
    // architecture. Permission names fall back to the documented strings.
    const healthModule = require('react-native-health');
    const perms = (healthModule.Constants ?? healthModule.default?.Constants)?.Permissions;
    const permissions = {
      permissions: {
        read: [
          perms?.HeartRate ?? 'HeartRate',
          perms?.OxygenSaturation ?? 'OxygenSaturation',
          perms?.RespiratoryRate ?? 'RespiratoryRate',
        ],
        write: [],
      },
    };

    return new Promise((resolve) => {
      NativeModules.AppleHealthKit.initHealthKit(permissions, (error: string) => {
        resolve(error ? 'denied' : 'granted');
      });
    });
  },
};
