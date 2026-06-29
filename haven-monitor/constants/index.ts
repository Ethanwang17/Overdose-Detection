export const APP_NAME = 'Haven';
export const APP_VERSION = '1.0.0';

export const BIOMETRIC_UPDATE_INTERVAL_MS = 3000;
export const EMERGENCY_COUNTDOWN_SECONDS = 30;
export const BACKGROUND_SYNC_INTERVAL_MS = 60_000;

export const ONBOARDING_STEPS = [
  { id: 0, isWelcome: true, cta: 'Get Started', permissionType: null },
  { id: 1, isWelcome: false, title: 'Connect your wearable', body: 'Haven reads your vitals through a compatible watch or band. Pair your device to begin monitoring.', cta: 'Connect Device', permissionType: 'device' },
  { id: 2, isWelcome: false, title: 'Access health data', body: 'Heart rate, blood oxygen, and respiratory rate are read continuously to catch early signs of distress.', cta: 'Allow Health Access', permissionType: 'health' },
  { id: 3, isWelcome: false, title: 'Share your location', body: 'If you ever need help, responders and your contacts can reach you faster.', cta: 'Allow Location', permissionType: 'location' },
  { id: 4, isWelcome: false, title: 'Enable notifications', body: 'We only reach out when something needs your attention — never for anything else.', cta: 'Allow Notifications', permissionType: 'notifications' },
  { id: 5, isWelcome: false, title: 'Add an emergency contact', body: 'Choose who Haven should notify the moment an emergency is detected.', cta: 'Add Contact', permissionType: 'contact' },
] as const;

export const STATUS_CONFIG = {
  normal: {
    label: 'Normal',
    sublabel: 'All vitals within your normal range.',
    updatedText: 'Updated just now · Live',
    dotColor: '#30A15C',
    tintColor: 'rgba(48,161,92,0.07)',
    textColor: '#268C4E',
  },
  elevated: {
    label: 'Elevated Risk',
    sublabel: 'Heart rate above your normal range. Monitoring closely.',
    updatedText: 'Updated 30s ago · Watching',
    dotColor: '#E0980A',
    tintColor: 'rgba(224,152,10,0.08)',
    textColor: '#B5790A',
  },
  critical: {
    label: 'Possible Overdose',
    sublabel: 'Critical vital signs detected. Emergency response is preparing.',
    updatedText: 'Critical · Responding now',
    dotColor: '#E5484D',
    tintColor: 'rgba(229,72,77,0.08)',
    textColor: '#D4333A',
  },
} as const;

export const MOCK_ALERTS = [
  { id: '1', severity: 'elevated', dotColor: '#E0980A', severityColor: '#B5790A', severityLabel: 'Elevated Risk', detail: 'Heart rate reached 118 BPM during sleep.', when: '2d ago', resolution: 'Resolved automatically — vitals normalized', createdAt: new Date() },
  { id: '2', severity: 'critical', dotColor: '#E5484D', severityColor: '#D4333A', severityLabel: 'Possible Overdose', detail: 'Blood oxygen dropped to 79% with depressed breathing.', when: '5d ago', resolution: 'Help called — responders dispatched', createdAt: new Date() },
  { id: '3', severity: 'elevated', dotColor: '#E0980A', severityColor: '#B5790A', severityLabel: 'Elevated Risk', detail: 'Respiratory rate elevated to 23 /min.', when: 'Jun 18', resolution: 'Marked OK by you', createdAt: new Date() },
  { id: '4', severity: 'elevated', dotColor: '#E0980A', severityColor: '#B5790A', severityLabel: 'Elevated Risk', detail: 'Heart rate reached 122 BPM after inactivity.', when: 'Jun 14', resolution: 'Resolved automatically', createdAt: new Date() },
  { id: '5', severity: 'critical', dotColor: '#E5484D', severityColor: '#D4333A', severityLabel: 'Possible Overdose', detail: 'Respiratory rate fell to 6 /min for 40 seconds.', when: 'Jun 7', resolution: 'Help called — contact notified', createdAt: new Date() },
  { id: '6', severity: 'elevated', dotColor: '#E0980A', severityColor: '#B5790A', severityLabel: 'Elevated Risk', detail: 'Blood oxygen dipped to 93%.', when: 'Jun 2', resolution: 'Marked OK by you', createdAt: new Date() },
] as const;
