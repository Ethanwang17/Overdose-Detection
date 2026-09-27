
// Core TypeScript types for Haven Monitor
// File: /Users/virurepalle/Code/Overdose-Detection/haven-monitor/types/index.ts

export type UserRole = 'patient' | 'parole_officer' | 'medical_admin' | 'emergency_contact' | 'system_admin';

export type BiometricStatus = 'normal' | 'elevated' | 'critical';

/**
 * Where a reading came from. 'manual' = typed into the Health app (trusted
 * only in development builds), 'demo' = the Demo sheet. Stored with every
 * vitals row and alert so the officer can tell real watch data from the rest.
 */
export type VitalSource = 'healthkit' | 'manual' | 'demo';

export interface BiometricReading {
  heartRate: number;
  spo2: number;
  respiratoryRate: number;
  movement: number;
  /** When the value was measured (HealthKit sample end), not when it was read */
  timestamp: Date;
  source?: VitalSource;
}

export interface BiometricBaseline {
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  respiratoryRateMin: number;
  respiratoryRateMax: number;
}

export interface VitalStatus {
  status: BiometricStatus;
  label: string;
  sublabel: string;
  updatedText: string;
  dotColor: string;
  tintColor: string;
  textColor: string;
}

export interface AlertRecord {
  id: string;
  severity: 'elevated' | 'critical';
  dotColor: string;
  severityColor: string;
  severityLabel: string;
  detail: string;
  when: string;
  resolution: string;
  resolvedAt?: Date;
  createdAt: Date;
  /** Absolute date + time, e.g. "Jul 8 · 2:41 PM" */
  timeLabel: string;
  /** Patient who raised the alert — shown in the officer view */
  patientName: string | null;
  latitude: number | null;
  longitude: number | null;
  source: VitalSource | 'unknown';
  /** Patient didn't answer the countdown (or asked for help) */
  escalatedAt?: Date;
  /** Officer confirmed they've seen it */
  acknowledgedAt?: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notifyOnAlert: boolean;
}

export interface WearableDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'fitbit' | 'garmin' | 'samsung' | 'bluetooth' | 'other';
  connectionStatus: 'connected' | 'disconnected' | 'pairing';
  batteryLevel: number;
  lastSync: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export interface DetectionSettings {
  sensitivity: 'low' | 'standard' | 'high';
  alertCountdownSeconds: number;
  enableBackgroundMonitoring: boolean;
}

/**
 * Post-login patient onboarding steps. 'welcome' and 'notifications' only
 * appear the first time; the rest reappear whenever what they set up is
 * lost (see features/onboarding/readiness).
 */
export type OnboardingStepKey = 'welcome' | 'watch' | 'location' | 'notifications' | 'contact';
