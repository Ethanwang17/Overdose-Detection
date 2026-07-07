import { create } from 'zustand';
import type { BiometricReading, BiometricStatus, VitalStatus } from '../../../types';
import { STATUS_CONFIG } from '../../../constants';

const MOCK_READINGS: Record<BiometricStatus, BiometricReading> = {
  normal: {
    heartRate: 72,
    spo2: 98,
    respiratoryRate: 15,
    movement: 0.8,
    timestamp: new Date(),
  },
  elevated: {
    heartRate: 105,
    spo2: 95,
    respiratoryRate: 22,
    movement: 0.2,
    timestamp: new Date(),
  },
  critical: {
    heartRate: 48,
    spo2: 88,
    respiratoryRate: 8,
    movement: 0.0,
    timestamp: new Date(),
  },
};

interface BiometricState {
  status: BiometricStatus;
  reading: BiometricReading | null;
  batteryLevel: number;
  connectionQuality: number;
  isConnected: boolean;
  emergency: boolean;
  calling: boolean;
  countdown: number;
  demoOpen: boolean;
  // True while the Demo sheet drives the display — live HealthKit polling
  // (useHealthKitVitals) stands down until resumeLive() is called.
  demoActive: boolean;
  countdownTimer: ReturnType<typeof setInterval> | null;

  setStatus: (status: BiometricStatus) => void;
  setReading: (reading: BiometricReading & { batteryLevel: number; connectionQuality: number }) => void;
  setEmergency: (active: boolean) => void;
  setCalling: (calling: boolean) => void;
  setCountdown: (n: number) => void;
  setDemoOpen: (open: boolean) => void;
  dismissEmergency: () => void;
  getVitalStatus: () => VitalStatus;

  // Demo / StatusScreen helpers
  changeMode: (mode: BiometricStatus) => void;
  resumeLive: () => void;
  startEmergency: () => void;
  stopEmergency: () => void;
  clearCountdownTimer: () => void;
}

export const useBiometricStore = create<BiometricState>((set, get) => ({
  status: 'normal',
  reading: MOCK_READINGS.normal,
  batteryLevel: 87,
  connectionQuality: 98,
  isConnected: true,
  emergency: false,
  calling: false,
  countdown: 30,
  demoOpen: false,
  demoActive: false,
  countdownTimer: null,

  setStatus: (status) => set({ status }),
  setReading: (reading) => set({
    reading,
    batteryLevel: reading.batteryLevel ?? 87,
    connectionQuality: reading.connectionQuality ?? 98,
  }),
  setEmergency: (active) => set({ emergency: active }),
  setCalling: (calling) => set({ calling }),
  setCountdown: (n) => set({ countdown: n }),
  setDemoOpen: (open) => set({ demoOpen: open }),
  dismissEmergency: () => {
    get().clearCountdownTimer();
    set({ emergency: false, calling: false, countdown: 30, status: 'normal' });
  },

  getVitalStatus: () => {
    const { status } = get();
    return { status, ...STATUS_CONFIG[status] };
  },

  changeMode: (mode) => {
    set({
      status: mode,
      demoActive: true,
      reading: { ...MOCK_READINGS[mode], timestamp: new Date() },
    });
  },

  resumeLive: () => set({ demoActive: false, status: 'normal' }),

  startEmergency: () => {
    get().clearCountdownTimer();
    set({ emergency: true, countdown: 30, calling: false });

    const timer = setInterval(() => {
      const currentCountdown = get().countdown;
      if (currentCountdown <= 1) {
        clearInterval(timer);
        set({ emergency: true, calling: true, countdown: 0, countdownTimer: null });
      } else {
        set({ countdown: currentCountdown - 1 });
      }
    }, 1000);

    set({ countdownTimer: timer });
  },

  stopEmergency: () => {
    get().clearCountdownTimer();
    set({ emergency: false, calling: false, countdown: 30 });
  },

  clearCountdownTimer: () => {
    const { countdownTimer } = get();
    if (countdownTimer) {
      clearInterval(countdownTimer);
      set({ countdownTimer: null });
    }
  },
}));
