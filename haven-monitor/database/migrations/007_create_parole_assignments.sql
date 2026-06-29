CREATE TABLE parole_officer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  officer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id, officer_id)
);

ALTER TABLE parole_officer_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own assignments" ON parole_officer_assignments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Officers view their assignments" ON parole_officer_assignments FOR SELECT USING (auth.uid() = officer_id);
