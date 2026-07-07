-- ============================================================================
-- Haven Monitor — RLS hardening (patch to live schema)
-- Idempotent. Applied to project dkkjsiohiibbgbunzxkb.
--
-- The live database ALREADY has correct, officer-scoped RLS on profiles,
-- vitals, and patient_locations (own-row for the user; SELECT for the
-- assigned officer). This patch only closes the two remaining holes:
--
--   1. admin_codes had a SELECT policy for the `public` role USING (true),
--      so the anon key could read every registration code. Removed — the
--      table is now deny-by-default for all clients. Registration validates
--      codes through the SECURITY DEFINER function below instead.
--
--   2. parole_officers had a SELECT policy for `authenticated` USING (true),
--      letting any logged-in user read every officer's invite_code. Tightened
--      to own-row. Patient signup no longer reads this table directly; it
--      goes through validate_officer_code().
-- ============================================================================

-- ── Code-validation RPCs (bypass RLS, expose only an id, callable pre-auth) ──

create or replace function public.validate_officer_code(p_code text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from parole_officers
  where invite_code = upper(trim(p_code))
  limit 1;
$$;

create or replace function public.validate_admin_code(p_code text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from admin_codes
  where code = upper(trim(p_code))
    and type = 'officer_registration'
    and used_by is null
  limit 1;
$$;

revoke all on function public.validate_officer_code(text) from public, anon, authenticated;
revoke all on function public.validate_admin_code(text)   from public, anon, authenticated;
grant execute on function public.validate_officer_code(text) to anon, authenticated;
grant execute on function public.validate_admin_code(text)   to anon, authenticated;

-- ── Hole 1: admin_codes readable by anon ─────────────────────────────────────
-- Drop the permissive policy. With RLS enabled and no SELECT policy, no client
-- role can read the table; only service_role (which bypasses RLS) and the
-- validate_admin_code() function can see rows.
drop policy if exists "admin_codes_read" on public.admin_codes;

-- ── Hole 2: any authenticated user can read all officers ─────────────────────
drop policy if exists "officers_read" on public.parole_officers;

create policy "officers_read_own"
  on public.parole_officers for select
  to authenticated
  using (user_id = auth.uid());
