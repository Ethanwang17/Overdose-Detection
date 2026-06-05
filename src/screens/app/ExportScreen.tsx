import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

interface ExportScreenProps {
  onClose: () => void;
}

type DateRange = 'today' | 'week' | 'month' | 'all';
type FileFormat = 'pdf' | 'csv';

interface DataOption {
  key: string;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const DATA_OPTIONS: DataOption[] = [
  {
    key: 'vitals',
    label: 'Biometric Vitals',
    subtitle: 'Heart rate, SpO2, respiratory rate',
    icon: 'pulse-outline',
  },
  {
    key: 'alerts',
    label: 'Alert Events',
    subtitle: 'Critical and moderate alerts',
    icon: 'warning-outline',
  },
  {
    key: 'sleep',
    label: 'Sleep & Recovery',
    subtitle: 'Sleep cycles and recovery scores',
    icon: 'moon-outline',
  },
  {
    key: 'sync',
    label: 'Device Sync Logs',
    subtitle: 'Wearable connection history',
    icon: 'sync-outline',
  },
];

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 Days' },
  { key: 'month', label: 'Last 30 Days' },
  { key: 'all', label: 'All Time' },
];

export default function ExportScreen({ onClose }: ExportScreenProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    vitals: true,
    alerts: true,
    sleep: false,
    sync: false,
  });
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [format, setFormat] = useState<FileFormat>('pdf');

  const toggle = (key: string) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Data</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Choose what to include in your export. Configure the data, range, and format below.
        </Text>

        {/* Data selection */}
        <Text style={styles.sectionLabel}>Data to Include</Text>
        <View style={styles.card}>
          {DATA_OPTIONS.map((opt, idx) => {
            const isOn = selected[opt.key];
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.dataRow, idx > 0 && styles.dataRowBorder]}
                activeOpacity={0.7}
                onPress={() => toggle(opt.key)}
              >
                <View style={styles.dataIconWrap}>
                  <Ionicons name={opt.icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.dataText}>
                  <Text style={styles.dataLabel}>{opt.label}</Text>
                  <Text style={styles.dataSubtitle}>{opt.subtitle}</Text>
                </View>
                <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                  {isOn && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date range */}
        <Text style={styles.sectionLabel}>Date Range</Text>
        <View style={styles.chipRow}>
          {DATE_RANGES.map((range) => {
            const active = dateRange === range.key;
            return (
              <TouchableOpacity
                key={range.key}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setDateRange(range.key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Format */}
        <Text style={styles.sectionLabel}>Format</Text>
        <View style={styles.formatRow}>
          <TouchableOpacity
            style={[styles.formatCard, format === 'pdf' && styles.formatCardActive]}
            activeOpacity={0.8}
            onPress={() => setFormat('pdf')}
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color={format === 'pdf' ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.formatLabel, format === 'pdf' && styles.formatLabelActive]}>
              Clinical PDF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.formatCard, format === 'csv' && styles.formatCardActive]}
            activeOpacity={0.8}
            onPress={() => setFormat('csv')}
          >
            <Ionicons
              name="grid-outline"
              size={24}
              color={format === 'csv' ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.formatLabel, format === 'csv' && styles.formatLabelActive]}>
              CSV Data
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Footer action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.exportButton, selectedCount === 0 && styles.exportButtonDisabled]}
          activeOpacity={0.8}
          disabled={selectedCount === 0}
          onPress={onClose}
        >
          <Ionicons name="download-outline" size={18} color={colors.onPrimary} />
          <Text style={styles.exportButtonText}>
            Export {selectedCount} {selectedCount === 1 ? 'Dataset' : 'Datasets'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 18,
    color: colors.onSurface,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  intro: {
    fontFamily: fonts.inter.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 19,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  dataRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerLow,
  },
  dataIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.infoContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataText: { flex: 1 },
  dataLabel: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 14,
    color: colors.onSurface,
    marginBottom: 2,
  },
  dataSubtitle: {
    fontFamily: fonts.inter.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.onPrimary,
    fontFamily: fonts.inter.semiBold,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formatCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLow,
  },
  formatCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.infoContainer,
  },
  formatLabel: {
    fontFamily: fonts.inter.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  formatLabelActive: {
    fontFamily: fonts.inter.semiBold,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerLow,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  exportButtonDisabled: {
    opacity: 0.4,
  },
  exportButtonText: {
    fontFamily: fonts.inter.semiBold,
    fontSize: 15,
    color: colors.onPrimary,
  },
});
