import { useCallback, useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../../lib/supabase';
import { alertsRepository } from '../../alerts/repositories/alertsRepository';
import { AlertService } from '../../../services/AlertService';
import type { AlertRecord } from '../../../types';

const POLL_MS = 4000;

function notify(alert: AlertRecord) {
  Notifications.scheduleNotificationAsync({
    content: {
      title: `${alert.patientName ?? 'Patient'} — ${alert.severityLabel}`,
      body: alert.detail,
      sound: true,
    },
    trigger: null,
  }).catch(() => {});
}

/**
 * Officer only, while the app is open: surfaces alerts from assigned
 * patients the officer hasn't acknowledged — every new one as it arrives
 * (Realtime, with polling as the fallback), plus any still-open ones on
 * launch. iOS suspends the app in the background, so reaching an officer
 * whose app is closed needs server-side push or a phone call; see
 * haven-monitor/docs/testing/field-test-plan.md (C4).
 */
export function useIncomingAlerts(enabled: boolean) {
  const [queue, setQueue] = useState<AlertRecord[]>([]);
  // null until the first load; that load only raises alerts still open
  const seen = useRef<Set<string> | null>(null);

  const check = useCallback(async () => {
    const alerts = await alertsRepository.getAlerts();
    const baseline = seen.current === null;
    if (baseline) seen.current = new Set();

    const fresh = alerts.filter(
      (a) => !seen.current!.has(a.id) && !a.acknowledgedAt && (!baseline || !a.resolvedAt)
    );
    alerts.forEach((a) => seen.current!.add(a.id));

    setQueue((prev) => {
      // Keep queued alerts current (escalated, resolved, acknowledged elsewhere)
      const updated = prev
        .map((item) => alerts.find((a) => a.id === item.id) ?? item)
        .filter((item) => !item.acknowledgedAt);
      return [...updated, ...fresh];
    });

    if (fresh.length) {
      Vibration.vibrate([0, 400, 200, 400]);
      fresh.forEach(notify);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    check().catch(() => {});
    const channel = supabase
      .channel('officer-incoming-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, () => {
        check().catch(() => {});
      })
      .subscribe();
    const timer = setInterval(() => { check().catch(() => {}); }, POLL_MS);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, [enabled, check]);

  const acknowledge = useCallback(async (alertId: string) => {
    await AlertService.acknowledge(alertId);
    setQueue((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  /** "Later": hide without acknowledging — it stays unacknowledged in Alerts */
  const dismiss = useCallback((alertId: string) => {
    setQueue((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  return { current: queue[0] ?? null, pending: queue.length, acknowledge, dismiss };
}
