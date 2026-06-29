CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  detection_sensitivity TEXT NOT NULL DEFAULT 'standard' CHECK (detection_sensitivity IN ('low','standard','high')),
  alert_countdown_seconds INTEGER NOT NULL DEFAULT 30,
  enable_background_monitoring BOOLEAN NOT NULL DEFAULT true,
  location_sharing TEXT NOT NULL DEFAULT 'while_monitoring' CHECK (location_sharing IN ('always','while_monitoring','never')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON user_settings USING (auth.uid() = user_id);
