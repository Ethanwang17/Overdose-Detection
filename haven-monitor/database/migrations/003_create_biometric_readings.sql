CREATE TABLE biometric_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_id UUID REFERENCES wearable_devices(id),
  heart_rate INTEGER,
  spo2 NUMERIC(5,2),
  respiratory_rate NUMERIC(5,2),
  movement NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal','elevated','critical')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biometric_readings_user_time ON biometric_readings(user_id, recorded_at DESC);

ALTER TABLE biometric_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own readings" ON biometric_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own readings" ON biometric_readings FOR INSERT WITH CHECK (auth.uid() = user_id);
