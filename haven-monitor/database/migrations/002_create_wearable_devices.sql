CREATE TABLE wearable_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('apple_watch','fitbit','garmin','samsung','bluetooth','other')),
  connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('connected','disconnected','pairing')),
  battery_level INTEGER DEFAULT 0 CHECK (battery_level >= 0 AND battery_level <= 100),
  last_sync TIMESTAMPTZ,
  device_identifier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE wearable_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own devices" ON wearable_devices USING (auth.uid() = user_id);
