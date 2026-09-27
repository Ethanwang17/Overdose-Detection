import { supabase } from '../lib/supabase';
import type { BiometricReading, BiometricStatus } from '../types';

export const VitalsService = {
  /**
   * Record a reading. sampled_at is when it was measured; the server stamps
   * recorded_at on arrival, so the officer can tell a fresh measurement from
   * a heartbeat re-send of an old one — and the gap between the two is the
   * watch-to-server latency.
   */
  async push(userId: string, reading: BiometricReading, status: BiometricStatus) {
    const { error } = await supabase.from('vitals').insert({
      user_id: userId,
      heart_rate: reading.heartRate,
      spo2: reading.spo2,
      respiratory_rate: reading.respiratoryRate,
      status,
      source: reading.source ?? 'healthkit',
      sampled_at: reading.timestamp.toISOString(),
    });
    if (error) throw error;
  },
};
