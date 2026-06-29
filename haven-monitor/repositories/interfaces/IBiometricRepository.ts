import type { BiometricReading, BiometricBaseline } from '../../types';

export interface IBiometricRepository {
  saveReading(reading: BiometricReading, userId: string): Promise<void>;
  getReadings(userId: string, from: Date, to: Date): Promise<BiometricReading[]>;
  getBaseline(userId: string): Promise<BiometricBaseline | null>;
  saveBaseline(userId: string, baseline: BiometricBaseline): Promise<void>;
}
