import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';

export default function DevicesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Devices</Text>
        <Text style={styles.pageSubtitle}>
          Manage the wearable devices used to monitor your biometrics.
        </Text>

        {/* Empty state */}
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⌚</Text>
          <Text style={styles.emptyTitle}>No device paired</Text>
          <Text style={styles.emptySubtitle}>
            Connect a compatible wearable to start monitoring your vitals.
          </Text>
        </View>

        {/* Add Device Button */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Text style={styles.addButtonText}>+ Add Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backChevron: {
    fontSize: 26,
    color: Colors.green,
    lineHeight: 30,
    marginTop: -2,
  },
  backLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.green,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 120,
    gap: Spacing.md,
  },
  pageTitle: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: Spacing.xs,
  },
  addButtonText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },
});
