import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../authentication/store/authStore';
import { Colors, Spacing, FontSize, FontWeight } from '../../../theme';
import { APP_OFFLINE_AFTER_MS, EMERGENCY_NUMBER } from '../../../constants';

// ── Types ─────────────────────────────────────────────────────────────────────

type VitalStatus = 'normal' | 'elevated' | 'critical';

interface Patient {
  id: string;
  name: string;
  email: string;
  onboarded_at: string | null;
}

interface VitalsSnapshot {
  heart_rate: number;
  spo2: number;
  respiratory_rate: number;
  status: VitalStatus;
  /** When the row reached the server — the app's heartbeat */
  recorded_at: string;
  /** When the watch measured it — how fresh the numbers are */
  sampled_at: string | null;
  source: 'healthkit' | 'manual' | 'demo' | 'unknown';
}

interface LocationSnapshot {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface DeviceSnapshot {
  location_ok: boolean;
  location_issue: string | null;
  watch_ok: boolean;
  watch_issue: string | null;
  watch_name: string | null;
}

interface PatientRow {
  patient: Patient;
  vitals: VitalsSnapshot | null;
  location: LocationSnapshot | null;
  device: DeviceSnapshot | null;
}

const VITALS_COLUMNS = 'heart_rate, spo2, respiratory_rate, status, recorded_at, sampled_at, source';
const POLL_MS = 5000;

async function fetchPatientState(patientId: string) {
  const [{ data: vitals }, { data: location }, { data: device }] = await Promise.all([
    supabase
      .from('vitals')
      .select(VITALS_COLUMNS)
      .eq('user_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('patient_locations')
      .select('latitude, longitude, recorded_at')
      .eq('user_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('device_status')
      .select('location_ok, location_issue, watch_ok, watch_issue, watch_name')
      .eq('user_id', patientId)
      .maybeSingle(),
  ]);
  return {
    vitals: (vitals as VitalsSnapshot | null) ?? null,
    location: (location as LocationSnapshot | null) ?? null,
    device: (device as DeviceSnapshot | null) ?? null,
  };
}

// ── Status helpers ────────────────────────────────────────────────────────────

function dotColor(status: VitalStatus | null): string {
  if (!status) return Colors.textDisabled;
  return status === 'normal' ? Colors.green : status === 'elevated' ? Colors.amber : Colors.red;
}

function statusLabel(status: VitalStatus | null): string {
  if (!status) return 'No data';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTextColor(status: VitalStatus | null): string {
  if (!status) return Colors.textMuted;
  return status === 'normal' ? Colors.greenDark : status === 'elevated' ? Colors.amberDark : Colors.redDark;
}

function cardTint(status: VitalStatus | null): string {
  if (!status || status === 'normal') return 'rgba(255,255,255,0.92)';
  if (status === 'elevated') return 'rgba(255, 249, 230, 0.95)';
  return 'rgba(255, 242, 241, 0.95)';
}

function mapsUrl(lat: number, lng: number): string {
  return `maps://maps.apple.com/?daddr=${lat},${lng}`;
}

function timeAgo(isoString: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/** Reasons the officer can act on, most urgent first */
function monitoringIssues(row: PatientRow): string[] {
  const issues: string[] = [];
  const { patient, vitals, device } = row;
  if (!patient.onboarded_at) issues.push('Setup not finished');
  if (vitals && Date.now() - new Date(vitals.recorded_at).getTime() > APP_OFFLINE_AFTER_MS) {
    issues.push(`App offline · seen ${timeAgo(vitals.recorded_at)}`);
  }
  if (device && !device.watch_ok) {
    issues.push(
      device.watch_issue === 'stale' ? 'Watch not reporting'
        : device.watch_issue === 'unavailable' ? 'Apple Health unavailable'
        : 'No watch data'
    );
  }
  if (device && !device.location_ok) {
    issues.push(device.location_issue === 'services_off' ? 'Location Services off' : 'Location permission off');
  }
  return issues;
}

// ── Patient card ──────────────────────────────────────────────────────────────

function PatientCard({ row }: { row: PatientRow }) {
  const router = useRouter();
  const { patient, vitals, location, device } = row;
  const status = vitals?.status ?? null;
  const tint = cardTint(status);
  const textC = statusTextColor(status);
  const issues = monitoringIssues(row);

  const handleDispatch = () => {
    Linking.openURL(`tel:${EMERGENCY_NUMBER}`);
  };

  const handleMap = () => {
    if (!location) return;
    Linking.openURL(mapsUrl(location.latitude, location.longitude));
  };

  const handleContacts = () => {
    router.push({ pathname: '/officer/contacts', params: { patientId: patient.id, name: patient.name } });
  };

  const measuredAt = vitals ? vitals.sampled_at ?? vitals.recorded_at : null;

  return (
    <View style={[styles.card, status === 'critical' && styles.cardCritical]}>
      <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[styles.cardOverlay, { backgroundColor: tint }]} />

      {/* Top row: avatar + name + status badge */}
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardName}>{patient.name}</Text>
          <Text style={styles.cardUpdated}>
            {measuredAt ? `Measured ${timeAgo(measuredAt)}` : 'No data yet'}
            {device?.watch_name ? ` · ${device.watch_name}` : ''}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: dotColor(status) }]} />
          <Text style={[styles.statusText, { color: textC }]}>{statusLabel(status)}</Text>
        </View>
      </View>

      {/* Why the data might be missing or untrustworthy */}
      {(issues.length > 0 || vitals?.source === 'demo' || vitals?.source === 'manual') && (
        <View style={styles.chipRow}>
          {vitals?.source === 'demo' && (
            <View style={[styles.chip, styles.chipNeutral]}>
              <Text style={styles.chipNeutralText}>DEMO DATA</Text>
            </View>
          )}
          {vitals?.source === 'manual' && (
            <View style={[styles.chip, styles.chipNeutral]}>
              <Text style={styles.chipNeutralText}>MANUAL ENTRY</Text>
            </View>
          )}
          {issues.map((issue) => (
            <View key={issue} style={[styles.chip, styles.chipWarn]}>
              <Text style={styles.chipWarnText}>{issue}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Vitals row */}
      {vitals ? (
        <View style={styles.vitalsRow}>
          <View style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{vitals.heart_rate}</Text>
            <Text style={styles.vitalLabel}>BPM</Text>
          </View>
          <View style={styles.vitalDivider} />
          <View style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{vitals.spo2}%</Text>
            <Text style={styles.vitalLabel}>SpO₂</Text>
          </View>
          <View style={styles.vitalDivider} />
          <View style={styles.vitalItem}>
            <Text style={styles.vitalValue}>{vitals.respiratory_rate}</Text>
            <Text style={styles.vitalLabel}>Breaths/min</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noVitals}>
          <Text style={styles.noVitalsText}>Awaiting first reading…</Text>
        </View>
      )}

      {/* Location + action row */}
      <View style={styles.cardBottom}>
        {location ? (
          <TouchableOpacity style={styles.locationChip} onPress={handleMap} activeOpacity={0.7}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} · {timeAgo(location.recorded_at)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.locationChip}>
            <Text style={styles.locationText}>No location</Text>
          </View>
        )}

        <TouchableOpacity style={styles.contactsBtn} onPress={handleContacts} activeOpacity={0.7}>
          <Text style={styles.contactsText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dispatchBtn} onPress={handleDispatch} activeOpacity={0.8}>
          <Text style={styles.dispatchText}>{EMERGENCY_NUMBER}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ParoleOfficerDashboard() {
  const session = useAuthStore((s) => s.session);
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerName, setOfficerName] = useState('Officer');
  const patientsRef = useRef<Patient[]>([]);

  const refreshAll = useCallback(async () => {
    const patients = patientsRef.current;
    if (!patients.length) return;
    const states = await Promise.all(patients.map((p) => fetchPatientState(p.id)));
    setRows(patients.map((patient, i) => ({ patient, ...states[i] })));
  }, []);

  // ── Initial load: officer → assigned patients → their latest state ─────

  useEffect(() => {
    if (!session?.user.id) return;
    let cancelled = false;

    (async () => {
      try {
        const { data: officerRow } = await supabase
          .from('parole_officers')
          .select('id, name')
          .eq('user_id', session.user.id)
          .single();

        if (!officerRow || cancelled) return;
        if (officerRow.name) setOfficerName(officerRow.name.split(' ')[0]);

        const { data: patients } = await supabase
          .from('profiles')
          .select('id, name, email, onboarded_at')
          .eq('officer_id', officerRow.id)
          .eq('role', 'patient');

        if (cancelled) return;
        patientsRef.current = patients ?? [];
        await refreshAll();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [session?.user.id, refreshAll]);

  // ── Realtime for fast updates; polling catches anything it misses and
  //    keeps "measured Xs ago" / "app offline" current ─────────────────────

  useEffect(() => {
    if (!session?.user.id) return;

    const updateRow = (userId: string, patch: Partial<PatientRow>) =>
      setRows((prev) => prev.map((r) => (r.patient.id === userId ? { ...r, ...patch } : r)));

    const vitalsChannel = supabase
      .channel('officer-vitals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vitals' }, (payload) => {
        const row = payload.new as VitalsSnapshot & { user_id: string };
        updateRow(row.user_id, { vitals: row });
      })
      .subscribe();

    const locationChannel = supabase
      .channel('officer-locations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'patient_locations' }, (payload) => {
        const row = payload.new as LocationSnapshot & { user_id: string };
        updateRow(row.user_id, { location: row });
      })
      .subscribe();

    const timer = setInterval(() => { refreshAll().catch(() => {}); }, POLL_MS);

    return () => {
      supabase.removeChannel(vitalsChannel);
      supabase.removeChannel(locationChannel);
      clearInterval(timer);
    };
  }, [session?.user.id, refreshAll]);

  // ── Derived counts ───────────────────────────────────────────────────────

  const normalCount = rows.filter((r) => r.vitals?.status === 'normal').length;
  const elevatedCount = rows.filter((r) => r.vitals?.status === 'elevated').length;
  const criticalCount = rows.filter((r) => r.vitals?.status === 'critical').length;
  const noDataCount = rows.filter((r) => !r.vitals).length;

  // Sort: critical first, then elevated, then normal, then no-data
  const sorted = [...rows].sort((a, b) => {
    const order = { critical: 0, elevated: 1, normal: 2 };
    const aO = a.vitals ? (order[a.vitals.status] ?? 3) : 3;
    const bO = b.vitals ? (order[b.vitals.status] ?? 3) : 3;
    return aO - bO;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome, {officerName}</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>Live monitoring</Text>
          </View>
        </View>

        {/* Summary row */}
        <View style={styles.summaryCard}>
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.cardOverlay} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: Colors.green }]}>{normalCount}</Text>
              <Text style={styles.summaryLabel}>Normal</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: Colors.amber }]}>{elevatedCount}</Text>
              <Text style={styles.summaryLabel}>Elevated</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: Colors.red }]}>{criticalCount}</Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryCount, { color: Colors.textMuted }]}>{noDataCount}</Text>
              <Text style={styles.summaryLabel}>No data</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ASSIGNED PATIENTS</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.ink} />
            <Text style={styles.loadingText}>Loading patients…</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No patients linked yet.</Text>
            <Text style={styles.emptySubtext}>
              Share your invite code with patients so they can connect their accounts.
            </Text>
          </View>
        ) : (
          sorted.map((row) => <PatientCard key={row.patient.id} row={row} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF0F5',
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 160,
  },

  // Header
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    paddingHorizontal: 4,
  },
  heading: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  liveLabel: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },

  // Summary card
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    overflow: 'hidden',
    shadowColor: '#8A90A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: Spacing.xl,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.base,
    paddingHorizontal: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: FontSize.heading2,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.4,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: FontWeight.medium,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },

  // Section
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    marginBottom: Spacing.sm,
    paddingLeft: 6,
  },

  // Patient card
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    overflow: 'hidden',
    shadowColor: '#8A90A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: 14,
  },
  cardCritical: {
    borderColor: 'rgba(212, 51, 58, 0.25)',
    shadowColor: '#D4333A',
    shadowOpacity: 0.2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  cardMeta: { flex: 1 },
  cardName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
  cardUpdated: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // Issue / provenance chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.base,
    marginBottom: 10,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipWarn: {
    backgroundColor: Colors.amberBadgeTint,
  },
  chipWarnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.amberDark,
  },
  chipNeutral: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  chipNeutralText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  // Vitals row
  vitalsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  vitalItem: {
    flex: 1,
    alignItems: 'center',
  },
  vitalValue: {
    fontSize: FontSize.heading2,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  vitalLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  vitalDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 4,
  },
  noVitals: {
    marginHorizontal: Spacing.base,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  noVitalsText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },

  // Bottom action row
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    gap: 8,
  },
  locationChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  locationPin: { fontSize: 12 },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    flexShrink: 1,
  },
  contactsBtn: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  contactsText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
  dispatchBtn: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 52,
    alignItems: 'center',
  },
  dispatchText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: 0.4,
  },

  // Loading / empty
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 14,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
