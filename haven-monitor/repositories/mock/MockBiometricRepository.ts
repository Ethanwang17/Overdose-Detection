import type { IBiometricRepository } from '../interfaces/IBiometricRepository';
import type { BiometricReading, BiometricBaseline } from '../../types';

export class MockBiometricRepository implements IBiometricRepository {
  private readings: BiometricReading[] = [];

  async saveReading(reading: BiometricReading): Promise<void> {
    this.readings.push(reading);
  }
  async getReadings(_userId: string, from: Date, to: Date): Promise<BiometricReading[]> {
    return this.readings.filter(r => r.timestamp >= from && r.timestamp <= to);
  }
  async getBaseline(): Promise<BiometricBaseline> {
    return { heartRateMin: 55, heartRateMax: 100, spo2Min: 94, respiratoryRateMin: 10, respiratoryRateMax: 20 };
  }
  async saveBaseline(): Promise<void> {
    // mock
  }
}
