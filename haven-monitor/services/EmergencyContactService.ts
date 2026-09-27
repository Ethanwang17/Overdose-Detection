import * as Contacts from 'expo-contacts';
import { supabase } from '../lib/supabase';
import type { EmergencyContact } from '../types';

// Who can write what is enforced by RLS (database/policies/003): a patient
// may add a contact only while they have none (onboarding); after that the
// assigned officer adds and removes them.

export interface PickedContact {
  name: string;
  phone: string;
  relationship?: string;
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
   * Resolves null if the user cancels the picker; rejects if access is
   * denied or the chosen contact has no phone number.
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
    if (!phone) {
      throw new Error(`${name || 'That contact'} has no phone number. Choose someone who can be called.`);
    }
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

  async count(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('emergency_contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return count ?? 0;
  },

  async add(userId: string, contact: PickedContact): Promise<void> {
    const { error } = await supabase.from('emergency_contacts').insert({
      user_id: userId,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || null,
    });
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    if (error) throw error;
  },
};
