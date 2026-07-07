import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';
import { EmergencyContactService } from '../../../services/EmergencyContactService';
import { useAuthStore } from '../../authentication/store/authStore';
import type { EmergencyContact } from '../../../types';

// ── Contact Card ─────────────────────────────────────────────────────────────

interface ContactCardProps {
  contact: EmergencyContact;
  isLast?: boolean;
  onRemove: (contact: EmergencyContact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, isLast, onRemove }) => (
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
      {!!contact.relationship && (
        <Text style={styles.contactRelationship}>{contact.relationship}</Text>
      )}
      <Text style={styles.contactPhone}>{contact.phone}</Text>
    </View>

    <TouchableOpacity
      style={styles.removeButton}
      onPress={() => onRemove(contact)}
      activeOpacity={0.6}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.removeButtonText}>Remove</Text>
    </TouchableOpacity>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const loadContacts = useCallback(async () => {
    if (!session?.user.id) {
      setIsLoading(false);
      return;
    }
    try {
      const rows = await EmergencyContactService.list(session.user.id);
      setContacts(rows);
    } catch {
      // keep whatever is displayed; a failed refresh isn't fatal
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAdd = async () => {
    if (isAdding || !session?.user.id) return;
    setIsAdding(true);
    try {
      const picked = await EmergencyContactService.pickContact();
      if (picked) {
        await EmergencyContactService.add(session.user.id, picked);
        await loadContacts();
      }
    } catch (err) {
      Alert.alert(
        'Could not add contact',
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (contact: EmergencyContact) => {
    Alert.alert('Remove contact', `Remove ${contact.name} from your emergency contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await EmergencyContactService.remove(contact.id);
            setContacts((prev) => prev.filter((c) => c.id !== contact.id));
          } catch {
            Alert.alert('Could not remove contact', 'Please try again.');
          }
        },
      },
    ]);
  };

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
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={Colors.green} />
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No emergency contacts yet. Add someone you trust.
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {contacts.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                isLast={index === contacts.length - 1}
                onRemove={handleRemove}
              />
            ))}
          </View>
        )}

        {/* Add Contact Button */}
        <TouchableOpacity
          style={[styles.addButton, isAdding && styles.addButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleAdd}
          disabled={isAdding}
        >
          <Text style={styles.addButtonText}>
            {isAdding ? 'Adding…' : '+ Add Emergency Contact'}
          </Text>
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

  // Remove
  removeButton: {
    paddingLeft: Spacing.sm,
  },
  removeButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.signOut,
  },

  // Empty / loading state
  emptyState: {
    paddingVertical: Spacing.hero,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyStateText: {
    fontSize: FontSize.base,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 21,
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
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.green,
  },
});
