import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { EmergencyContact } from '../types';

// Onboarding can run before sign-in, so a contact picked there is stashed
// locally and flushed to Supabase once a session exists (see app/_layout).
const PENDING_KEY = 'haven.pendingEmergencyContact';

export interface PickedContact {
  name: string;
  phone: string;
}

function rowToContact(row: {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  notify_on_alert: boolean;
}): EmergencyContact {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    relationship: row.relationship ?? '',
    notifyOnAlert: row.notify_on_alert,
  };
}

export const EmergencyContactService = {
  /**
   * Ask for contacts access and open the system contact picker.
   * Resolves null if the user cancels the picker; rejects if access is denied.
   */
  async pickContact(): Promise<PickedContact | null> {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Contacts access is off. You can allow it in Settings and try again.');
    }
    const contact = await Contacts.presentContactPickerAsync();
    if (!contact) return null;

    const name =
      contact.name ?? [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    const phone = contact.phoneNumbers?.[0]?.number ?? '';
    if (!name && !phone) return null;
    return { name: name || phone, phone };
  },

  async list(userId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('id, name, phone, relationship, notify_on_alert')
      .eq('user_id', userId)
      .order('created_at');
    if (error) throw error;
    return (data ?? []).map(rowToContact);
  },

  async add(userId: string, contact: PickedContact): Promise<void> {
    const { error } = await supabase.from('emergency_contacts').insert({
      user_id: userId,
      name: contact.name,
      phone: contact.phone,
    });
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    if (error) throw error;
  },

  async stashPending(contact: PickedContact): Promise<void> {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(contact));
  },

  async flushPending(userId: string): Promise<void> {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    if (!raw) return;
    // Remove before inserting so concurrent auth events can't double-insert;
    // restore on failure so the next launch retries.
    await AsyncStorage.removeItem(PENDING_KEY);
    try {
      await EmergencyContactService.add(userId, JSON.parse(raw) as PickedContact);
    } catch {
      await AsyncStorage.setItem(PENDING_KEY, raw);
    }
  },
};
