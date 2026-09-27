export const APP_NAME = 'Haven';
export const APP_VERSION = '1.0.0';

export const BIOMETRIC_UPDATE_INTERVAL_MS = 3000;
export const HEALTHKIT_POLL_INTERVAL_MS = 5_000;
export const EMERGENCY_COUNTDOWN_SECONDS = 30;
export const BACKGROUND_SYNC_INTERVAL_MS = 60_000;

// Vitals are pushed the moment they change; this re-sends the current
// reading so the officer can tell the app is still online.
export const VITALS_HEARTBEAT_MS = 15_000;

// No trusted heart-rate sample from the watch for this long = disconnected,
// which sends the patient back through the watch onboarding step. Apple
// Watch records background heart rate every few minutes while worn.
export const WATCH_STALE_MINUTES = 30;

// How often the patient app re-checks watch/location while open (it also
// re-checks every time the app returns to the foreground).
export const READINESS_RECHECK_MS = 5 * 60_000;

// The patient's latest push older than this shows as "App offline" to the
// officer (3–4 missed heartbeats).
export const APP_OFFLINE_AFTER_MS = 60_000;

// Dialed by "Call for help" and the officer's call button. Override in
// .env for test builds so a demo never rings real emergency services.
export const EMERGENCY_NUMBER = process.env.EXPO_PUBLIC_EMERGENCY_NUMBER ?? '911';

// Copy for the post-login patient onboarding. 'repair' variants are shown
// when a step reappears because what it set up was lost.
export const ONBOARDING_COPY = {
  welcome: {
    title: 'Haven',
    body: 'Continuous monitoring that\nwatches over you, quietly.',
  },
  watch: {
    title: 'Connect your Apple Watch',
    repairTitle: 'Your Apple Watch disconnected',
    body: 'Haven reads heart rate, blood oxygen and breathing from your Apple Watch through Apple Health. Wear your watch and allow Health access.',
    repairBody: `Haven hasn't received heart-rate data from your watch in over ${WATCH_STALE_MINUTES} minutes. Put your watch on and make sure Health access for Haven is on.`,
  },
  location: {
    title: 'Share your location',
    repairTitle: 'Location is off',
    body: 'If you ever need help, your parole officer and responders can reach you faster.',
    repairBody: 'Haven can no longer see your location. Turn it back on to continue.',
  },
  notifications: {
    title: 'Enable notifications',
    body: 'We only reach out when something needs your attention — never for anything else.',
  },
  contact: {
    title: 'Add an emergency contact',
    body: 'Choose who should be reached if an emergency is detected. After setup, your parole officer manages your emergency contacts.',
  },
} as const;

export const STATUS_CONFIG = {
  normal: {
    label: 'Normal',
    sublabel: 'All vitals within your normal range.',
    updatedText: 'Updated just now · Live',
    dotColor: '#1DB954',
    tintColor: 'rgba(29,185,84,0.18)',
    textColor: '#157A3C',
  },
  elevated: {
    label: 'Elevated Risk',
    sublabel: 'Heart rate above your normal range. Monitoring closely.',
    updatedText: 'Updated 30s ago · Watching',
    dotColor: '#F5A623',
    tintColor: 'rgba(245,166,35,0.20)',
    textColor: '#A86A00',
  },
  critical: {
    label: 'Possible Overdose',
    sublabel: 'Critical vital signs detected. Emergency response is preparing.',
    updatedText: 'Critical · Responding now',
    dotColor: '#FF3B30',
    tintColor: 'rgba(255,59,48,0.18)',
    textColor: '#C0000A',
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
