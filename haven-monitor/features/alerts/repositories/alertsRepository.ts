import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../theme';
import type { AlertRecord } from '../../../types';

export interface IAlertsRepository {
  getAlerts(): Promise<AlertRecord[]>;
  getAlertById(id: string): Promise<AlertRecord | null>;
}

function deriveColors(severity: 'elevated' | 'critical') {
  if (severity === 'critical') {
    return { dotColor: Colors.red, severityColor: Colors.redDark, severityLabel: 'Possible Overdose' };
  }
  return { dotColor: Colors.amber, severityColor: Colors.amberDark, severityLabel: 'Elevated Risk' };
}

function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function rowToRecord(row: {
  id: string;
  severity: string;
  detail: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
}): AlertRecord {
  const severity = row.severity as 'elevated' | 'critical';
  const { dotColor, severityColor, severityLabel } = deriveColors(severity);
  return {
    id: row.id,
    severity,
    dotColor,
    severityColor,
    severityLabel,
    detail: row.detail,
    when: timeAgo(row.created_at),
    resolution: row.resolution ?? 'Resolved',
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
    createdAt: new Date(row.created_at),
  };
}

class SupabaseAlertsRepository implements IAlertsRepository {
  async getAlerts(): Promise<AlertRecord[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('alerts')
      .select('id, severity, detail, resolution, resolved_at, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(rowToRecord);
  }

  async getAlertById(id: string): Promise<AlertRecord | null> {
    const { data, error } = await supabase
      .from('alerts')
      .select('id, severity, detail, resolution, resolved_at, created_at')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return rowToRecord(data);
  }
}

export const alertsRepository: IAlertsRepository = new SupabaseAlertsRepository();
