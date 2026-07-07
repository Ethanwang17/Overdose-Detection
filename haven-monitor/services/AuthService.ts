import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../features/authentication/store/authStore';

function generateInviteCode(): string {
  return 'PO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Postgres unique_violation: the row already exists, e.g. from a concurrent
// ensureProfile call or a partially completed earlier registration.
const UNIQUE_VIOLATION = '23505';

// When email confirmation is required and the address is already registered,
// signUp() returns an obfuscated user with an empty identities array instead
// of an error.
function isExistingEmail(user: User | null): boolean {
  return user?.identities?.length === 0;
}

export const AuthService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async registerPatient(email: string, password: string, name: string, officerCode: string) {
    // Validate officer invite code via SECURITY DEFINER RPC — the
    // parole_officers table is not directly readable by clients (RLS).
    const { data: officerId, error: officerErr } = await supabase.rpc('validate_officer_code', {
      p_code: officerCode,
    });
    if (officerErr || !officerId) throw new Error('Invalid officer code. Please check with your parole officer.');

    // Registration details ride along in user_metadata: when email
    // confirmation is required, signUp() returns no session, so RLS blocks
    // creating the profile row until the first sign-in (see ensureProfile).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'patient', officer_code: officerCode } },
    });
    if (error) throw error;
    if (isExistingEmail(data.user)) {
      throw new Error('An account with this email already exists. Try signing in instead.');
    }

    if (!data.session) {
      return { ...data, needsEmailConfirmation: true };
    }

    await this.ensureProfile(data.session.user);
    return { ...data, needsEmailConfirmation: false };
  },

  async registerOfficer(email: string, password: string, name: string, adminCode: string) {
    // Validate admin code via SECURITY DEFINER RPC — the admin_codes
    // table is not directly readable by clients (RLS).
    const { data: adminCodeId, error: codeErr } = await supabase.rpc('validate_admin_code', {
      p_code: adminCode,
    });
    if (codeErr || !adminCodeId) throw new Error('Invalid admin code. Contact your Haven administrator.');

    // The invite code is generated up front and stored in user_metadata so
    // the officer sees it at registration even though the parole_officers
    // row may only be created after email confirmation (see ensureProfile).
    const inviteCode = generateInviteCode();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'parole_officer', admin_code: adminCode, invite_code: inviteCode } },
    });
    if (error) throw error;
    if (isExistingEmail(data.user)) {
      throw new Error('An account with this email already exists. Try signing in instead.');
    }

    if (!data.session) {
      return { ...data, inviteCode, needsEmailConfirmation: true };
    }

    await this.ensureProfile(data.session.user);
    return { ...data, inviteCode, needsEmailConfirmation: false };
  },

  /**
   * Fetch the caller's profile, creating any rows registration could not.
   * With email confirmation required, signUp() returns no session, so RLS
   * (auth.uid() is null) blocks the profile/parole_officers inserts at
   * registration time. This runs on every authenticated session and
   * finishes the job from the data stashed in user_metadata at signup.
   */
  async ensureProfile(user: User): Promise<Profile> {
    const { data: existing, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (existing) return existing as Profile;

    const meta = user.user_metadata ?? {};
    const name = meta.name as string | undefined;
    const role = meta.role as string | undefined;
    const email = user.email ?? '';

    if (!name || (role !== 'patient' && role !== 'parole_officer')) {
      throw new Error(
        'Your account is missing its registration details, so setup could not be completed. Please register again with a different email.'
      );
    }

    if (role === 'parole_officer') {
      const { data: officerRow, error: officerFetchErr } = await supabase
        .from('parole_officers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (officerFetchErr) throw officerFetchErr;

      if (!officerRow) {
        // Re-validate: the admin code could have been revoked between
        // signup and email confirmation.
        const { data: adminCodeId, error: adminErr } = await supabase.rpc('validate_admin_code', {
          p_code: meta.admin_code ?? '',
        });
        if (adminErr || !adminCodeId) {
          throw new Error('Your admin code is no longer valid. Contact your Haven administrator for a new code.');
        }

        const { error: officerInsertErr } = await supabase.from('parole_officers').insert({
          user_id: user.id,
          name,
          email,
          invite_code: meta.invite_code ?? generateInviteCode(),
        });
        if (officerInsertErr && officerInsertErr.code !== UNIQUE_VIOLATION) {
          throw new Error(`Could not finish setting up your officer account: ${officerInsertErr.message}`);
        }
      }

      const { error: profileErr } = await supabase.from('profiles').insert({
        id: user.id,
        name,
        email,
        role: 'parole_officer',
        officer_id: null,
      });
      if (profileErr && profileErr.code !== UNIQUE_VIOLATION) {
        throw new Error(`Could not finish setting up your account: ${profileErr.message}`);
      }
    } else {
      // Re-validate: the officer's invite code could have changed between
      // signup and email confirmation.
      const { data: officerId, error: officerErr } = await supabase.rpc('validate_officer_code', {
        p_code: meta.officer_code ?? '',
      });
      if (officerErr || !officerId) {
        throw new Error('Your officer invite code is no longer valid. Please contact your parole officer for a new code.');
      }

      const { error: profileErr } = await supabase.from('profiles').insert({
        id: user.id,
        name,
        email,
        role: 'patient',
        officer_id: officerId,
      });
      if (profileErr && profileErr.code !== UNIQUE_VIOLATION) {
        throw new Error(`Could not finish setting up your account: ${profileErr.message}`);
      }
    }

    return this.fetchProfile(user.id);
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
