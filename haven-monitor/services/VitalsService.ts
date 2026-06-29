import { supabase } from '../lib/supabase';

export interface LatestVitals {
  id: string;
  user_id: string;
  heart_rate: number;
  spo2: number;
  respiratory_rate: number;
  status: 'normal' | 'elevated' | 'critical';
  recorded_at: string;
}

export const VitalsService = {
  async push(
    userId: string,
    heartRate: number,
    spo2: number,
    respiratoryRate: number,
    status: string,
  ) {
    await supabase.from('vitals').insert({
      user_id: userId,
      heart_rate: heartRate,
      spo2,
      respiratory_rate: respiratoryRate,
      status,
    });
  },

  async getLatest(userId: string): Promise<LatestVitals | null> {
    const { data } = await supabase
      .from('vitals')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    return data ?? null;
  },
};
