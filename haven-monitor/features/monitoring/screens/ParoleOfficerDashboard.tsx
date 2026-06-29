import React, { useEffect, useRef, useState } from 'react';
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
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../authentication/store/authStore';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────

type VitalStatus = 'normal' | 'elevated' | 'critical';

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface VitalsSnapshot {
  heart_rate: number;
  spo2: number;
  respiratory_rate: number;
  status: VitalStatus;
  recorded_at: string;
}

interface LocationSnapshot {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface PatientRow {
  patient: Patient;
  vitals: VitalsSnapshot | null;
  location: LocationSnapshot | null;
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
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// ── Patient card ──────────────────────────────────────────────────────────────

function PatientCard({ row }: { row: PatientRow }) {
  const { patient, vitals, location } = row;
  const status = vitals?.status ?? null;
  const tint = cardTint(status);
  const textC = statusTextColor(status);

  const handleDispatch = () => {
    Linking.openURL('tel:911');
  };

  const handleMap = () => {
    if (!location) return;
    Linking.openURL(mapsUrl(location.latitude, location.longitude));
  };

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
            {vitals ? `Updated ${timeAgo(vitals.recorded_at)}` : 'No data yet'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: dotColor(status) }]} />
          <Text style={[styles.statusText, { color: textC }]}>{statusLabel(status)}</Text>
        </View>
      </View>

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
            <Text style={styles.locationText}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.locationChip}>
            <Text style={styles.locationText}>No location</Text>
          </View>
        )}

        <TouchableOpacity style={styles.dispatchBtn} onPress={handleDispatch} activeOpacity={0.8}>
          <Text style={styles.dispatchText}>911</Text>
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
  const patientIdsRef = useRef<string[]>([]);
  const patientsRef = useRef<Patient[]>([]);

  // ── Initial data load ────────────────────────────────────────────────────

  useEffect(() => {
    if (!session?.user.id) return;
    let cancelled = false;

    (async () => {
      try {
        // 1. Get parole_officers row for this user
        const { data: officerRow } = await supabase
          .from('parole_officers')
          .select('id, name')
          .eq('user_id', session.user.id)
          .single();

        if (!officerRow || cancelled) return;
        if (officerRow.name) setOfficerName(officerRow.name.split(' ')[0]);

        // 2. Get all patients linked to this officer
        const { data: patients } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('officer_id', officerRow.id)
          .eq('role', 'patient');

        if (!patients || cancelled) {
          setLoading(false);
          return;
        }

        patientIdsRef.current = patients.map((p) => p.id);
        patientsRef.current = patients;

        // 3. Fetch latest vitals + location for each patient in parallel
        const patientRows = await Promise.all(
          patients.map(async (patient): Promise<PatientRow> => {
            const [{ data: vitalsData }, { data: locData }] = await Promise.all([
              supabase
                .from('vitals')
                .select('heart_rate, spo2, respiratory_rate, status, recorded_at')
                .eq('user_id', patient.id)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .single(),
              supabase
                .from('patient_locations')
                .select('latitude, longitude, recorded_at')
                .eq('user_id', patient.id)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .single(),
            ]);
            return { patient, vitals: vitalsData ?? null, location: locData ?? null };
          })
        );

        if (!cancelled) {
          setRows(patientRows);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [session?.user.id]);

  // ── Realtime subscriptions ───────────────────────────────────────────────

  useEffect(() => {
    if (!session?.user.id) return;

    const vitalsChannel = supabase
      .channel('officer-vitals')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vitals' },
        (payload) => {
          const row = payload.new as {
            user_id: string;
            heart_rate: number;
            spo2: number;
            respiratory_rate: number;
            status: VitalStatus;
            recorded_at: string;
          };
          if (!patientIdsRef.current.includes(row.user_id)) return;
          setRows((prev) =>
            prev.map((r) =>
              r.patient.id === row.user_id
                ? {
                    ...r,
                    vitals: {
                      heart_rate: row.heart_rate,
                      spo2: row.spo2,
                      respiratory_rate: row.respiratory_rate,
                      status: row.status,
                      recorded_at: row.recorded_at,
                    },
                  }
                : r
            )
          );
        }
      )
      .subscribe();

    const locationChannel = supabase
      .channel('officer-locations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'patient_locations' },
        (payload) => {
          const row = payload.new as {
            user_id: string;
            latitude: number;
            longitude: number;
            recorded_at: string;
          };
          if (!patientIdsRef.current.includes(row.user_id)) return;
          setRows((prev) =>
            prev.map((r) =>
              r.patient.id === row.user_id
                ? {
                    ...r,
                    location: {
                      latitude: row.latitude,
                      longitude: row.longitude,
                      recorded_at: row.recorded_at,
                    },
                  }
                : r
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vitalsChannel);
      supabase.removeChannel(locationChannel);
    };
  }, [session?.user.id]);

  // ── Poll every 5s for latest vitals (belt-and-suspenders over Realtime) ──

  useEffect(() => {
    const poll = async () => {
      const patients = patientsRef.current;
      if (!patients.length) return;
      const updates = await Promise.all(
        patients.map(async (patient) => {
          const { data } = await supabase
            .from('vitals')
            .select('heart_rate, spo2, respiratory_rate, status, recorded_at')
            .eq('user_id', patient.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();
          return { patientId: patient.id, vitals: data ?? null };
        })
      );
      setRows((prev) =>
        prev.map((r) => {
          const u = updates.find((x) => x.patientId === r.patient.id);
          return u ? { ...r, vitals: u.vitals } : r;
        })
      );
    };

    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, []);

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
    gap: 10,
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
  dispatchBtn: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    minWidth: 58,
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
