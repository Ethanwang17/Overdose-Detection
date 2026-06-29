import * as Location from 'expo-location';

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
};
