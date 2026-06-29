CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES alerts(id),
  type TEXT NOT NULL CHECK (type IN ('emergency','status_change','reminder','system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_status TEXT DEFAULT 'sent' CHECK (delivery_status IN ('sent','delivered','failed'))
);

ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON notification_history FOR SELECT USING (auth.uid() = user_id);
