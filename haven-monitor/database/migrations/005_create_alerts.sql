CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('elevated','critical')),
  detail TEXT NOT NULL,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  reading_id UUID REFERENCES biometric_readings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_time ON alerts(user_id, created_at DESC);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own alerts" ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages alerts" ON alerts USING (auth.role() = 'service_role');
