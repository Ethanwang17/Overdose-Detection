import { supabase } from '../lib/supabase';
import type { Profile } from '../features/authentication/store/authStore';

function generateInviteCode(): string {
  return 'PO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async registerPatient(email: string, password: string, name: string, officerCode: string) {
    // Validate officer invite code
    const { data: officer, error: officerErr } = await supabase
      .from('parole_officers')
      .select('id')
      .eq('invite_code', officerCode.trim().toUpperCase())
      .single();
    if (officerErr || !officer) throw new Error('Invalid officer code. Please check with your parole officer.');

    // Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;

    // Create profile
    await supabase.from('profiles').insert({
      id: data.user!.id,
      name,
      email,
      role: 'patient',
      officer_id: officer.id,
    });

    return data;
  },

  async registerOfficer(email: string, password: string, name: string, adminCode: string) {
    // Validate admin code
    const { data: code, error: codeErr } = await supabase
      .from('admin_codes')
      .select('id')
      .eq('code', adminCode.trim().toUpperCase())
      .eq('type', 'officer_registration')
      .single();
    if (codeErr || !code) throw new Error('Invalid admin code. Contact your Haven administrator.');

    // Create auth user
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;

    const inviteCode = generateInviteCode();

    // Create parole_officers row
    await supabase.from('parole_officers').insert({
      user_id: data.user!.id,
      name,
      email,
      invite_code: inviteCode,
    });

    // Create profile
    await supabase.from('profiles').insert({
      id: data.user!.id,
      name,
      email,
      role: 'parole_officer',
      officer_id: null,
    });

    return { ...data, inviteCode };
  },

  async fetchProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
