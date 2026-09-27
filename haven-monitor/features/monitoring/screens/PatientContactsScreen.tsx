import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../../../theme';
import { EmergencyContactService } from '../../../services/EmergencyContactService';
import { useAuthStore } from '../../authentication/store/authStore';
import type { EmergencyContact } from '../../../types';

/**
 * Officer only: a patient's emergency contacts. Patients add their first
 * contact during onboarding and can't change them afterwards, so this is
 * the only place contacts are edited. RLS limits it to the officer's own
 * patients.
 */
export default function PatientContactsScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { patientId, name: patientName } = useLocalSearchParams<{ patientId: string; name?: string }>();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!patientId) return;
    try {
      setContacts(await EmergencyContactService.list(patientId));
    } catch {
      // keep what's shown; a failed refresh isn't fatal
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (profile && profile.role !== 'parole_officer') return <Redirect href="/(app)" />;

  const handleAdd = async () => {
    if (!patientId) return;
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Enter a name and phone number.');
      return;
    }
    setSaving(true);
    try {
      await EmergencyContactService.add(patientId, {
        name: name.trim(),
        phone: phone.trim(),
        relationship: relationship.trim(),
      });
      setName('');
      setPhone('');
      setRelationship('');
      await load();
    } catch (err) {
      Alert.alert('Could not add contact', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (contact: EmergencyContact) => {
    Alert.alert('Remove contact', `Remove ${contact.name} from ${patientName ?? 'this patient'}'s emergency contacts?`, [
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backLabel}>Patients</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Emergency contacts</Text>
          <Text style={styles.pageSubtitle}>
            {patientName ?? 'This patient'} can't edit these after setup — changes are made here.
          </Text>

          {loading ? (
            <ActivityIndicator color={Colors.ink} style={styles.loading} />
          ) : contacts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No emergency contacts on file.</Text>
              <Text style={styles.emptySubtext}>
                The patient will be asked to add one the next time they open Haven.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {contacts.map((contact, i) => (
                <View key={contact.id} style={[styles.contactRow, i === contacts.length - 1 && styles.contactRowLast]}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {!!contact.relationship && <Text style={styles.contactMeta}>{contact.relationship}</Text>}
                    <Text style={styles.contactMeta}>{contact.phone}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(contact)} activeOpacity={0.6} hitSlop={8}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionLabel}>ADD A CONTACT</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={relationship}
            onChangeText={setRelationship}
            placeholder="Relationship (optional)"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="sentences"
          />
          <TouchableOpacity
            style={[styles.addButton, saving && styles.addButtonBusy]}
            onPress={handleAdd}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.addButtonText}>{saving ? 'Adding…' : 'Add Contact'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bgGray },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backChevron: { fontSize: 26, color: Colors.green, lineHeight: 30, marginTop: -2 },
  backLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.medium, color: Colors.green },
  content: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 80,
    gap: 10,
  },
  pageTitle: {
    fontSize: FontSize.heading1,
    fontWeight: FontWeight.bold,
    color: Colors.ink,
    letterSpacing: -0.6,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  loading: { marginVertical: Spacing.xl },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    padding: Spacing.base,
    gap: 4,
  },
  emptyText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.ink },
  emptySubtext: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 20 },
  list: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactRowLast: { borderBottomWidth: 0 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.ink },
  contactMeta: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },
  removeText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.red },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    marginTop: Spacing.lg,
    paddingLeft: 4,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderCard,
    paddingHorizontal: Spacing.base,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },
  addButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addButtonBusy: { opacity: 0.7 },
  addButtonText: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.white },
});
