-- ============================================================================
-- Haven Monitor — allow vitals rows without SpO2 / respiratory rate
-- Idempotent. Applied to project dkkjsiohiibbgbunzxkb.
--
-- Fitbit devices (including the Fitbit Edge) measure blood oxygen and
-- breathing rate only during sleep, and Apple Watch records respiratory
-- rate only during sleep. Daytime readings therefore often carry heart rate
-- alone. Store the missing metrics as NULL ("not measured") rather than 0,
-- which reads as a critical value.
-- ============================================================================

alter table public.vitals alter column spo2 drop not null;
alter table public.vitals alter column respiratory_rate drop not null;
