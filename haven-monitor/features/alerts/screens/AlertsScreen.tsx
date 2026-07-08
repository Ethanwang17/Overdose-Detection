import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '../../../theme';
import AlertItem from '../components/AlertItem';
import { alertsRepository } from '../repositories/alertsRepository';
import type { AlertRecord } from '../../../types';

const AlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertsRepository.getAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  const elevatedCount = alerts.filter(a => a.severity === 'elevated').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>Elevated & critical events · past 30 days</Text>
        </View>

        {/* Badge row */}
        <View style={styles.badgeRow}>
          <View style={styles.badgeElevated}>
            <View style={[styles.badgeDot, { backgroundColor: Colors.amber }]} />
            <Text style={styles.badgeTextElevated}>{elevatedCount} Elevated</Text>
          </View>
          <View style={styles.badgeCritical}>
            <View style={[styles.badgeDot, { backgroundColor: Colors.red }]} />
            <Text style={styles.badgeTextCritical}>{criticalCount} Critical</Text>
          </View>
        </View>

        {/* Alert list */}
        <View style={styles.alertList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.ink} />
              <Text style={styles.loadingText}>Loading alerts…</Text>
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No alerts in the past 30 days</Text>
              <Text style={styles.emptySubtext}>You're all clear.</Text>
            </View>
          ) : (
            alerts.map(alert => (
              <AlertItem
                key={alert.id}
                id={alert.id}
                severity={alert.severity}
                dotColor={alert.dotColor}
                severityColor={alert.severityColor}
                severityLabel={alert.severityLabel}
                detail={alert.detail}
                when={alert.when}
                resolution={alert.resolution}
              />
            ))
          )}
        </View>

        {!loading && alerts.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>No earlier alerts in this period</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF0F5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 150,
  },
  header: {
    paddingTop: 6,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 10,
  },
  badgeElevated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.amberBadgeTint,
  },
  badgeCritical: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.redBadgeTint,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeTextElevated: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.amberDark,
  },
  badgeTextCritical: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.redDark,
  },
  alertList: {
    marginTop: 12,
  },
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
  },
  footer: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: '#B8B8BD',
  },
});

export default AlertsScreen;
