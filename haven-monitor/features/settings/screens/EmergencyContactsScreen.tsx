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
import type { EmergencyContact } from '../../../types';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: EmergencyContact[] = [
  {
    id: '1',
    name: 'Sarah Morgan',
    relationship: 'Sister',
    phone: '+1 (555) 234-5678',
    notifyOnAlert: true,
  },
  {
    id: '2',
    name: 'Dr. James Lee',
    relationship: 'Physician',
    phone: '+1 (555) 876-5432',
    notifyOnAlert: true,
  },
];

// ── Contact Card ─────────────────────────────────────────────────────────────

interface ContactCardProps {
  contact: EmergencyContact;
  isLast?: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, isLast }) => (
  <View style={[styles.contactCard, isLast && styles.contactCardLast]}>
    {/* Avatar initial */}
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
    </View>

    {/* Info */}
    <View style={styles.contactInfo}>
      <View style={styles.contactNameRow}>
        <Text style={styles.contactName}>{contact.name}</Text>
        {contact.notifyOnAlert && (
          <View style={styles.notifyBadge}>
            <Text style={styles.notifyBadgeText}>Notify</Text>
          </View>
        )}
      </View>
      <Text style={styles.contactRelationship}>{contact.relationship}</Text>
      <Text style={styles.contactPhone}>{contact.phone}</Text>
    </View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function EmergencyContactsScreen() {
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
        <Text style={styles.pageTitle}>Emergency{'\n'}Contacts</Text>

        <Text style={styles.pageSubtitle}>
          These people will be contacted if an overdose alert is triggered and you don't respond in time.
        </Text>

        {/* Contact List */}
        <View style={styles.cardList}>
          {MOCK_CONTACTS.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isLast={index === MOCK_CONTACTS.length - 1}
            />
          ))}
        </View>

        {/* Add Contact Button */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Text style={styles.addButtonText}>+ Add Emergency Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },

  // Header
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

  // Scroll
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 120,
  },

  // Title
  pageTitle: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    lineHeight: 38,
    marginBottom: Spacing.md,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.section,
  },

  // Card List
  cardList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  // Contact Card
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  contactCardLast: {},

  // Avatar
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },

  // Contact Info
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  contactName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.ink,
  },
  notifyBadge: {
    backgroundColor: Colors.greenTint,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  notifyBadgeText: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
    letterSpacing: 0.2,
  },
  contactRelationship: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },

  // Add Button
  addButton: {
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addButtonText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },
});
