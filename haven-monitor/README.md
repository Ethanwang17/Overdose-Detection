# Haven Monitor

## Overview

Haven Monitor is a production-ready mobile app for continuous overdose detection and biometric monitoring. It connects to wearable devices to track Heart Rate, Blood Oxygen (SpO2), Respiratory Rate, and Movement, analyzing trends against individual baselines to detect medical distress and trigger emergency alerts.

The app is built for harm-reduction programs, parole supervision, and recovery support contexts where real-time health monitoring can mean the difference between life and death.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React Native 0.83 + Expo SDK 55** | Cross-platform mobile (iOS + Android) with managed workflow |
| **Expo Router 5** | File-system-based navigation with typed routes |
| **TypeScript 5.9 (strict)** | End-to-end type safety across the entire codebase |
| **Supabase** | Postgres database, Row Level Security, real-time subscriptions, Auth |
| **Zustand 5** | Lightweight client-side state for biometric readings and emergency state |
| **TanStack Query 5** | Server-state management: caching, background refetch, pagination |
| **React Hook Form + Zod** | Performant forms with schema validation |
| **expo-blur** | Native blur effects for the floating tab bar on iOS |
| **react-native-svg** | Custom icons rendered as scalable vector graphics |
| **expo-notifications** | Push notification scheduling and delivery |
| **expo-location** | GPS location capture for emergency alerts |
| **expo-secure-store** | Encrypted on-device storage for auth tokens |
| **@expo-google-fonts/inter** | Inter typeface loaded at runtime |

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/virurepalle/Overdose-Detection.git
cd Overdose-Detection/haven-monitor

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials (see Supabase Setup below)

# 4. Start the development server
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i` for iOS simulator / `a` for Android emulator.

---

## Project Structure

```
haven-monitor/
├── app/                        # Expo Router file-system routes
│   ├── _layout.tsx             # Root layout: fonts, QueryClient, StatusBar
│   ├── index.tsx               # Entry redirect → /onboarding
│   ├── onboarding.tsx          # Onboarding flow
│   ├── (auth)/                 # Unauthenticated route group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (app)/                  # Authenticated app shell
│       ├── _layout.tsx         # Tab shell with FloatingTabBar
│       └── index.tsx
├── features/                   # Feature modules (vertical slices)
│   ├── alerts/
│   │   ├── screens/AlertsScreen.tsx
│   │   ├── components/AlertItem.tsx
│   │   ├── hooks/
│   │   └── repositories/
│   ├── authentication/
│   ├── biometrics/
│   │   ├── simulation/         # Biometric simulation engine
│   │   ├── store/biometricStore.ts   # Zustand store
│   │   └── hooks/
│   ├── dashboard/
│   │   ├── screens/StatusScreen.tsx
│   │   └── components/
│   │       ├── StatusCard.tsx
│   │       ├── VitalMetric.tsx
│   │       ├── EmergencyOverlay.tsx
│   │       └── DemoSheet.tsx
│   ├── monitoring/
│   └── settings/
│       ├── screens/
│       │   ├── SettingsScreen.tsx
│       │   ├── DevicesScreen.tsx
│       │   └── EmergencyContactsScreen.tsx
│       └── hooks/
├── shared/
│   └── components/
│       ├── FloatingTabBar.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── StatusBadge.tsx
│       ├── EmptyState.tsx
│       └── SkeletonLoader.tsx
├── services/
│   ├── AuthService.ts
│   ├── NotificationService.ts
│   └── LocationService.ts
├── repositories/               # Data access layer (repository pattern)
├── lib/
│   └── supabase.ts             # Supabase client singleton
├── theme/
│   ├── colors.ts               # Design tokens: Colors, Radius, Spacing, FontSize
│   └── index.ts
├── types/
│   └── index.ts                # Shared TypeScript types
├── constants/
├── database/
│   ├── migrations/             # 10 SQL migration files (001–010)
│   └── policies/               # Row Level Security policies
└── assets/
```

---

## Architecture

### Repository Pattern

All data access is encapsulated behind repository interfaces in `repositories/`. Features never call Supabase directly — they call repository methods. This makes the data layer swappable (e.g. switching from Supabase to a different backend) and testable in isolation.

### Client State: Zustand

`features/biometrics/store/biometricStore.ts` holds the live biometric reading, alert status, emergency countdown, and simulation mode. It is the single source of truth for the real-time monitoring panel. The store is kept flat and serializable.

### Server State: TanStack Query

Historical alerts, user profile, emergency contacts, and device list are fetched and cached via TanStack Query. Queries are co-located with their feature hooks (e.g. `features/alerts/hooks/`). Mutations invalidate the relevant query cache keys on success.

### Biometric Simulation Engine

Located in `features/biometrics/simulation/`, the engine emits synthetic readings at a configurable interval. Three modes are available:

- **normal** — HR 65-75, SpO2 97-99%, RR 14-18/min
- **elevated** — HR 95-105, SpO2 94-96%, RR 22-26/min
- **critical** — HR 38-42, SpO2 84-88%, RR 4-7/min (overdose simulation)

The simulation is designed to be replaced by a Bluetooth/BLE hardware adapter without changing any consumer code.

### Emergency Detection Flow

1. Biometric simulation engine emits a reading to the Zustand store.
2. The store evaluates the reading against per-vital thresholds.
3. If thresholds are breached, `status` advances to `elevated` or `critical`.
4. When `critical` persists beyond the configured window, `startEmergency()` is dispatched.
5. `EmergencyOverlay` renders over all content with a 30-second countdown.
6. The user can tap "I'm OK" to dismiss, or "Call for Help" to trigger immediate emergency contact notification.
7. If the countdown expires without interaction, location is captured and emergency contacts are notified via push notification.

---

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Copy your project URL and anon key from **Project Settings > API**.
3. Add them to your `.env` file:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Open the Supabase SQL Editor and run each migration in order:
   ```
   database/migrations/001_create_profiles.sql
   database/migrations/002_create_wearable_devices.sql
   database/migrations/003_create_biometric_readings.sql
   database/migrations/004_create_baseline_metrics.sql
   database/migrations/005_create_alerts.sql
   database/migrations/006_create_emergency_contacts.sql
   database/migrations/007_create_parole_assignments.sql
   database/migrations/008_create_user_settings.sql
   database/migrations/009_create_notification_history.sql
   database/migrations/010_create_audit_logs.sql
   ```
5. Apply RLS policies from `database/policies/` to lock down row-level access.

---

## Screens and Navigation

```
/ (index.tsx)
 └── /onboarding              Walkthrough for new users
      └── /(auth)/login       Sign in with email + password
      └── /(auth)/register    Create account
      └── /(auth)/forgot-password  Password reset
           └── /(app)/        Authenticated shell (FloatingTabBar)
                ├── Status    Live vitals, status card, emergency overlay
                ├── Alerts    Historical alert feed with severity badges
                └── Settings
                     ├── Profile (editable inline)
                     ├── Devices (wearable device management)
                     └── Emergency Contacts (add/remove contacts)
```

Navigation is managed by Expo Router. The `(auth)` and `(app)` route groups control layout nesting without affecting URL segments. The `(app)/_layout.tsx` shell renders a single `View` that swaps child screens based on `activeTab` state and overlays the `FloatingTabBar`.

---

## Biometric Simulation

The simulator lives in `features/biometrics/simulation/`. On the Status screen, tap the **Demo** button (top-right) to open a bottom sheet with four actions:

- **Set Normal** — transitions vitals into the safe range
- **Set Elevated** — triggers amber warning state
- **Set Overdose** — triggers critical state and will start the emergency countdown
- **Trigger Emergency** — immediately opens the emergency overlay with the full countdown

To integrate a real wearable:

1. Add a Bluetooth/BLE adapter module (e.g. `react-native-ble-plx`).
2. Implement the same `BiometricReading` interface used by the simulator.
3. Dispatch readings to the Zustand store using the same `setReading()` action.
4. Remove the `DemoSheet` or gate it behind a developer settings flag.

---

## Future Integrations

The following integrations are planned but not yet implemented. Each would replace or supplement the simulation engine with real device data.

- **Fitbit** — OAuth 2.0 via Fitbit Web API; HR and SpO2 available on Sense/Versa series
- **Apple HealthKit** — `expo-health` or native module; HR, SpO2, and respiratory rate from Apple Watch
- **Google Fit** — REST API; HR and activity data from Wear OS devices
- **Garmin Connect** — Garmin Health API; HR, SpO2, stress score from Forerunner/Fenix series
- **Samsung Health** — Samsung Health SDK; HR and SpO2 from Galaxy Watch series

---

## Development

### Type Checking

```bash
npm run type-check
```

TypeScript is configured in strict mode (`tsconfig.json`). All feature code, services, and repositories are fully typed.

### Linting

```bash
npm run lint
```

ESLint is configured for React Native + TypeScript. Prettier handles formatting.

### Running on Device

```bash
npx expo start
# Press 'i' for iOS simulator, 'a' for Android emulator, or scan QR with Expo Go
```

### Building for Production

```bash
npx eas build --platform ios
npx eas build --platform android
```

Requires an Expo account and EAS CLI (`npm install -g eas-cli`).
