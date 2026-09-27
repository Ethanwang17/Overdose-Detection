import { supabase } from '../lib/supabase';

/**
 * Watch and location health as the patient app last saw it. The officer
 * dashboard reads this to explain *why* a patient's data stopped (watch off
 * the wrist, location turned off) rather than just showing it as stale.
 */
export interface DeviceStatus {
  location_ok: boolean;
  location_issue: 'services_off' | 'denied' | 'undetermined' | null;
  watch_ok: boolean;
  watch_issue: 'stale' | 'no_data' | 'unavailable' | null;
  watch_name: string | null;
  last_watch_sample_at: string | null;
}

export const DeviceStatusService = {
  async report(userId: string, status: DeviceStatus) {
    const { error } = await supabase
      .from('device_status')
      .upsert({ user_id: userId, ...status }, { onConflict: 'user_id' });
    if (error) throw error;
  },
};
