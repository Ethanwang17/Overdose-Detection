# Haven Monitor Database

## Setup
1. Install Supabase CLI: npm install -g supabase
2. Link project: supabase link --project-ref YOUR_PROJECT_REF
3. Run migrations: supabase db push

## Tables
- profiles: User profiles (extends Supabase auth)
- wearable_devices: Connected monitoring devices
- biometric_readings: Heart rate, SpO2, respiratory rate readings
- baseline_metrics: Individual user health baselines
- alerts: Elevated and critical health events
- emergency_contacts: User-defined emergency contacts
- parole_officer_assignments: Patient-officer relationships
- user_settings: Per-user app configuration
- notification_history: Alert notification delivery log
- audit_logs: Security and compliance audit trail

## RLS
All tables use Row Level Security. Users can only access their own data.
Service role has elevated access for server-side operations.
