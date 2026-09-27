-- ============================================================================
-- Haven Monitor — role rules, post-login onboarding, telemetry integrity
-- Idempotent. Applied to project dkkjsiohiibbgbunzxkb.
--
-- Enforces the product rules in the database, where a modified client
-- can't route around them (the anon key ships in every app bundle):
--
--   1. A patient can't change their role or which officer they're linked
--      to. Before this, profiles_own (FOR ALL) let a patient rewrite
--      role/officer_id on their own row — i.e. unlink from their officer.
--   2. Registration codes are verified server-side. Before this, the
--      invite/admin code checks ran only in the app; anyone calling the
--      REST API could insert a parole_officers row and an officer profile.
--   3. Patients add their first emergency contact during onboarding and
--      can't edit or remove contacts afterwards; their officer manages them.
--   4. Telemetry is append-only for patients: vitals, locations and alerts
--      can't be deleted or backdated, and lifecycle timestamps come from
--      the server clock.
--
-- Also adds what the post-login onboarding and officer dashboard read:
-- profiles.onboarded_at, vitals.source/sampled_at, alert escalation and
-- acknowledgement, and device_status (watch + location health per patient).
--
-- The checks apply to end-user requests (JWT role authenticated/anon).
-- Migrations, the SQL editor and service_role pass through.
-- ============================================================================

-- ── Profiles: onboarding stamp, immutable role/officer link ─────────────────

alter table public.profiles add column if not exists onboarded_at timestamptz;

revoke update, delete on public.profiles from anon, authenticated;
grant update (onboarded_at) on public.profiles to authenticated;

create or replace function public.enforce_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
begin
  if coalesce(auth.jwt() ->> 'role', '') not in ('authenticated', 'anon') then
    return new;
  end if;

  new.onboarded_at := null;
  select raw_user_meta_data into meta from auth.users where id = new.id;

  if new.role = 'patient' then
    if new.officer_id is null
       or new.officer_id is distinct from
          public.validate_officer_code(coalesce(meta ->> 'officer_code', '')) then
      raise exception 'Invalid officer invite code' using errcode = '42501';
    end if;
  elsif new.role = 'parole_officer' then
    if new.officer_id is not null
       or public.validate_admin_code(coalesce(meta ->> 'admin_code', '')) is null then
      raise exception 'Invalid admin code' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_profile_insert() from public, anon, authenticated;

drop trigger if exists profiles_enforce_insert on public.profiles;
create trigger profiles_enforce_insert
  before insert on public.profiles
  for each row execute function public.enforce_profile_insert();

-- ── Parole officers: admin code required, no client edits ───────────────────

revoke update, delete on public.parole_officers from anon, authenticated;

create or replace function public.enforce_officer_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
begin
  if coalesce(auth.jwt() ->> 'role', '') not in ('authenticated', 'anon') then
    return new;
  end if;

  select raw_user_meta_data into meta from auth.users where id = new.user_id;
  if public.validate_admin_code(coalesce(meta ->> 'admin_code', '')) is null then
    raise exception 'Invalid admin code' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_officer_insert() from public, anon, authenticated;

drop trigger if exists parole_officers_enforce_insert on public.parole_officers;
create trigger parole_officers_enforce_insert
  before insert on public.parole_officers
  for each row execute function public.enforce_officer_insert();

-- ── Vitals: provenance + sample time, append-only ───────────────────────────

-- source: where the reading came from. 'manual' = typed into the Health app
-- (only accepted in development builds), 'demo' = the Demo sheet.
-- sampled_at: when the watch measured it; recorded_at: when it reached us.
alter table public.vitals
  add column if not exists source text not null default 'unknown',
  add column if not exists sampled_at timestamptz;

alter table public.vitals drop constraint if exists vitals_source_check;
alter table public.vitals add constraint vitals_source_check
  check (source in ('healthkit', 'manual', 'demo', 'unknown'));

revoke insert, update, delete on public.vitals from anon, authenticated;
grant insert (user_id, heart_rate, spo2, respiratory_rate, status, source, sampled_at)
  on public.vitals to authenticated;

-- ── Patient locations: append-only ──────────────────────────────────────────

revoke insert, update, delete on public.patient_locations from anon, authenticated;
grant insert (user_id, latitude, longitude, address)
  on public.patient_locations to authenticated;

-- ── Alerts: provenance, escalation, officer acknowledgement ─────────────────

alter table public.alerts
  add column if not exists source text not null default 'unknown',
  add column if not exists escalated_at timestamptz,
  add column if not exists acknowledged_at timestamptz;

alter table public.alerts drop constraint if exists alerts_source_check;
alter table public.alerts add constraint alerts_source_check
  check (source in ('healthkit', 'manual', 'demo', 'unknown'));

revoke insert, update, delete on public.alerts from anon, authenticated;
grant insert (user_id, severity, detail, latitude, longitude, source)
  on public.alerts to authenticated;
grant update (resolution, resolved_at, escalated_at) on public.alerts to authenticated;

-- Lifecycle timestamps use the server clock and can't be rewritten once set.
create or replace function public.stamp_alert_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.resolved_at is not null then
    new.resolved_at := old.resolved_at;
    new.resolution := old.resolution;
  elsif new.resolved_at is not null then
    new.resolved_at := now();
  end if;

  if old.escalated_at is not null then
    new.escalated_at := old.escalated_at;
  elsif new.escalated_at is not null then
    new.escalated_at := now();
  end if;

  if old.acknowledged_at is not null then
    new.acknowledged_at := old.acknowledged_at;
  end if;
  return new;
end;
$$;

drop trigger if exists alerts_stamp_update on public.alerts;
create trigger alerts_stamp_update
  before update on public.alerts
  for each row execute function public.stamp_alert_update();

-- Officers acknowledge through this function rather than a column grant, so
-- they can't touch anything else on a patient's alert and the time is the
-- server's. Returns the acknowledgement time.
create or replace function public.acknowledge_alert(p_alert_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  ts timestamptz;
begin
  update alerts a
     set acknowledged_at = coalesce(a.acknowledged_at, now())
   where a.id = p_alert_id
     and a.user_id in (
       select p.id from profiles p
       where p.officer_id = (select id from parole_officers where user_id = auth.uid())
     )
  returning a.acknowledged_at into ts;

  if ts is null then
    raise exception 'Alert not found' using errcode = '42501';
  end if;
  return ts;
end;
$$;

revoke all on function public.acknowledge_alert(uuid) from public, anon;
grant execute on function public.acknowledge_alert(uuid) to authenticated;

-- ── Emergency contacts: patient sets the first, officer manages ─────────────

drop policy if exists contacts_own on public.emergency_contacts;

drop policy if exists contacts_patient_read on public.emergency_contacts;
create policy contacts_patient_read on public.emergency_contacts
  for select to authenticated
  using (user_id = auth.uid());

-- A policy on emergency_contacts can't query emergency_contacts itself
-- (Postgres rejects it as recursive), so the check runs in a definer function.
create or replace function public.caller_has_emergency_contact()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from emergency_contacts where user_id = auth.uid());
$$;

revoke all on function public.caller_has_emergency_contact() from public, anon;
grant execute on function public.caller_has_emergency_contact() to authenticated;

-- Only while the patient has none — i.e. during onboarding, or if their
-- officer has removed them all.
drop policy if exists contacts_patient_first on public.emergency_contacts;
create policy contacts_patient_first on public.emergency_contacts
  for insert to authenticated
  with check (user_id = auth.uid() and not public.caller_has_emergency_contact());

drop policy if exists contacts_officer_manage on public.emergency_contacts;
create policy contacts_officer_manage on public.emergency_contacts
  for all to authenticated
  using (
    user_id in (
      select p.id from profiles p
      where p.officer_id = (select id from parole_officers where user_id = auth.uid())
    )
  )
  with check (
    user_id in (
      select p.id from profiles p
      where p.officer_id = (select id from parole_officers where user_id = auth.uid())
    )
  );

-- ── Device status: watch + location health, reported by the patient app ────

create table if not exists public.device_status (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  location_ok boolean not null default false,
  location_issue text,
  watch_ok boolean not null default false,
  watch_issue text,
  watch_name text,
  last_watch_sample_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.device_status enable row level security;

drop policy if exists device_status_own on public.device_status;
create policy device_status_own on public.device_status
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists device_status_officer_read on public.device_status;
create policy device_status_officer_read on public.device_status
  for select to authenticated
  using (
    user_id in (
      select p.id from profiles p
      where p.officer_id = (select id from parole_officers where user_id = auth.uid())
    )
  );

revoke delete on public.device_status from anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists device_status_touch on public.device_status;
create trigger device_status_touch
  before insert or update on public.device_status
  for each row execute function public.touch_updated_at();
