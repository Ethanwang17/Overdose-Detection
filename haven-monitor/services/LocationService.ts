import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

/**
 * 'services_off' = Location Services disabled system-wide; 'denied' = Haven's
 * permission refused. canAskAgain false means iOS won't show the prompt
 * again and the patient has to change it in Settings.
 */
export type LocationState =
  | { state: 'ok' }
  | { state: 'services_off' }
  | { state: 'denied'; canAskAgain: boolean }
  | { state: 'undetermined' };

export const LocationService = {
  async requestPermissions() {
    const fg = await Location.requestForegroundPermissionsAsync();
    return fg.status === 'granted';
  },

  async getStatus(): Promise<LocationState> {
    if (!(await Location.hasServicesEnabledAsync())) return { state: 'services_off' };
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') return { state: 'ok' };
    if (status === 'undetermined') return { state: 'undetermined' };
    return { state: 'denied', canAskAgain };
  },

  async getCurrentLocation() {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { latitude: location.coords.latitude, longitude: location.coords.longitude };
  },

  async pushToDatabase(userId: string) {
    const coords = await LocationService.getCurrentLocation();
    if (!coords) return;
    await supabase.from('patient_locations').insert({
      user_id: userId,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  },
};
