CREATE TABLE baseline_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  heart_rate_min INTEGER NOT NULL DEFAULT 55,
  heart_rate_max INTEGER NOT NULL DEFAULT 100,
  spo2_min NUMERIC(5,2) NOT NULL DEFAULT 94.0,
  respiratory_rate_min NUMERIC(5,2) NOT NULL DEFAULT 10.0,
  respiratory_rate_max NUMERIC(5,2) NOT NULL DEFAULT 20.0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE baseline_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own baseline" ON baseline_metrics USING (auth.uid() = user_id);
