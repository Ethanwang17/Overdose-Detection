import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },
  async sendEmergencyAlert(contactName: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Haven Emergency Alert',
        body: `Emergency alert triggered. ${contactName} has been notified.`,
        sound: true,
      },
      trigger: null,
    });
  },
  async sendStatusAlert(message: string) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Haven Monitor', body: message },
      trigger: null,
    });
  },
};
