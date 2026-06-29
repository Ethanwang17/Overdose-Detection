
// Core TypeScript types for Haven Monitor
// File: /Users/virurepalle/Code/Overdose-Detection/haven-monitor/types/index.ts

export type UserRole = 'patient' | 'parole_officer' | 'medical_admin' | 'emergency_contact' | 'system_admin';

export type BiometricStatus = 'normal' | 'elevated' | 'critical';

export interface BiometricReading {
  heartRate: number;
  spo2: number;
  respiratoryRate: number;
  movement: number;
  timestamp: Date;
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

export interface OnboardingStep {
  id: number;
  isWelcome: boolean;
  title?: string;
  body?: string;
  cta: string;
  permissionType?: 'device' | 'health' | 'location' | 'notifications' | 'contact';
}
