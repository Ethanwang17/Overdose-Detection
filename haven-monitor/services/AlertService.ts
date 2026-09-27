import { supabase } from '../lib/supabase';
import { LocationService } from './LocationService';
import type { VitalSource } from '../types';

// Timestamps for resolved/escalated/acknowledged are stamped by the server
// (see database/policies/003) — values sent here only mark "set it now".

export const AlertService = {
  /**
   * Insert an alert for the given user, stamping the device's current GPS
   * position when available. Location failures never block the alert.
   */
  async create(
    userId: string,
    severity: 'elevated' | 'critical',
    detail: string,
    source: VitalSource | 'unknown' = 'unknown',
  ) {
    let coords: { latitude: number; longitude: number } | null = null;
    try {
      // Cap the GPS wait at 4s — a stalled fix must never block the alert
      coords = await Promise.race([
        LocationService.getCurrentLocation(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);
    } catch {
      // no location permission / GPS failure — record the alert anyway
    }
    const { error } = await supabase.from('alerts').insert({
      user_id: userId,
      severity,
      detail,
      source,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    });
    if (error) throw error;
  },

  /** Mark all of the user's open alerts resolved. */
  async resolveOpen(userId: string, resolution: string) {
    const { error } = await supabase
      .from('alerts')
      .update({ resolution, resolved_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('resolved_at', null);
    if (error) throw error;
  },

  /**
   * The patient didn't answer the emergency countdown (or asked for help):
   * flag their open alerts as escalated so the officer sees it. Creates a
   * critical alert first if none is open, e.g. when an emergency is
   * triggered while the status was already critical.
   */
  async escalate(userId: string, detail: string, source: VitalSource | 'unknown') {
    const { data: open } = await supabase
      .from('alerts')
      .select('id')
      .eq('user_id', userId)
      .is('resolved_at', null)
      .limit(1);
    if (!open?.length) {
      await AlertService.create(userId, 'critical', detail, source);
    }
    const { error } = await supabase
      .from('alerts')
      .update({ escalated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('resolved_at', null)
      .is('escalated_at', null);
    if (error) throw error;
  },

  /** Officer: confirm they've seen an alert. Returns the server's timestamp. */
  async acknowledge(alertId: string): Promise<Date> {
    const { data, error } = await supabase.rpc('acknowledge_alert', { p_alert_id: alertId });
    if (error) throw error;
    return new Date(data as string);
  },
};
