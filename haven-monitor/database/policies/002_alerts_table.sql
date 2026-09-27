-- ============================================================================
-- Haven Monitor — alerts table (patch to live schema)
-- Idempotent. Applied to project dkkjsiohiibbgbunzxkb.
--
-- Elevated/critical events recorded by the patient app on status
-- transitions (see features/alerts/hooks/useAlertSync). Patients own their
-- rows; the assigned parole officer can read them. 003 narrows what either
-- side may write.
-- ============================================================================

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  severity text not null check (severity in ('elevated', 'critical')),
  detail text not null default '',
  latitude double precision,
  longitude double precision,
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists alerts_user_created on public.alerts (user_id, created_at desc);

alter table public.alerts enable row level security;

drop policy if exists alerts_own on public.alerts;
create policy alerts_own on public.alerts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists alerts_officer_read on public.alerts;
create policy alerts_officer_read on public.alerts
  for select to authenticated
  using (
    user_id in (
      select p.id from profiles p
      where p.officer_id = (select id from parole_officers where user_id = auth.uid())
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.alerts;
exception when duplicate_object then null;
end $$;
