import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export const LocationService = {
  async requestPermissions() {
    const fg = await Location.requestForegroundPermissionsAsync();
    return fg.status === 'granted';
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
