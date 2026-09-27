# Haven field test plan

Three things to prove on real hardware:

- **A. Apple Watch connection:** the app knows when it is, and isn't, getting data from the patient's watch.
- **B. Live data to the officer:** vitals reach the officer's screen, and we measure how fast.
- **C. Elevated state → the officer is called:** an elevated or critical event reaches the officer as a call.

## Where things stand before testing

Read this first. It decides what "pass" can mean today.

| Capability | Built today | Not built yet |
|---|---|---|
| Watch connection | HealthKit read access. A freshness check (a heart-rate sample within `WATCH_STALE_MINUTES` = 30). Re-onboarding when the watch goes stale. Watch status reported to the officer (`device_status`). Values typed into the Health app are ignored in release builds. | No check that the sample came from a watch rather than another app. No alert when the patient switches to a different watch (the officer only sees the watch's name). |
| Live data to officer | Only while the patient app is in the **foreground**. A reading is pushed as soon as it changes, plus a heartbeat every 15 s. The officer app gets it by Realtime, or by polling every 5 s. | **Background delivery.** iOS suspends the app when it's backgrounded or the phone is locked, so data stops. That needs HealthKit background delivery (`HKObserverQuery` with `enableBackgroundDelivery`), background location, or a watchOS companion app. |
| Call to officer | An alert row is written, with location. The patient is escalated if they don't answer the 30 s countdown. The **officer app, if open,** shows a full-screen alert with vibration, a notification, Call / Map / Acknowledge buttons, and records an acknowledgement time. | **An actual phone call, or a push notification to an officer whose app is closed.** Both need a server side: a Supabase Database Webhook, an Edge Function, and Twilio Voice or APNs push. See the build spec under C4. |

What the Apple Watch actually records also limits "live". Apple doesn't publish a sampling cadence:

- **Heart rate:** background readings are typically minutes apart while the watch is worn. During a workout it's recorded far more often.
- **Blood oxygen:** measured occasionally in the background. Availability also varies by watch model and region, so check that the test watch records it (**Health › Blood Oxygen**).
- **Respiratory rate:** recorded during sleep.

"Live" from a real watch therefore means minutes in everyday wear and seconds during a workout. The tests below measure that. They don't assume it.

## Setup

**Devices**
- Patient: a physical iPhone with an Apple Watch paired to it. Turn on wrist detection, and turn on Heart Rate and Blood Oxygen background measurements.
- Officer: a second iPhone, or the Mac's iOS Simulator for the parts that need no watch.
- Both on development builds: `npx expo run:ios --device <udid>` from `haven-monitor/`. The simulator only exercises the UI flows. It has no watch, so the dev-only "Continue without a watch" skip exists for it.

**Environment**
- In `.env`, set `EXPO_PUBLIC_EMERGENCY_NUMBER` to a team member's phone. **Never test with 911.**
- Accounts: `officer.test@haven.app`, plus a patient linked to that officer.
- Keep both phones on automatic date and time. Latency is measured against server timestamps where possible, which removes most clock skew.

**Measurement queries.** Run these in the Supabase SQL editor, replacing `<patient email>`:

```sql
-- Watch → server latency, one row per real sample (heartbeats re-send the
-- same sampled_at; take the first arrival).
select sampled_at,
       min(recorded_at)              as first_arrival,
       min(recorded_at) - sampled_at as watch_to_server
from vitals
where user_id = (select id from profiles where email = '<patient email>')
  and source = 'healthkit'
  and recorded_at > now() - interval '1 hour'
group by sampled_at
order by sampled_at desc;

-- Alert timeline: created → escalated → acknowledged by the officer.
select severity, source, created_at,
       escalated_at - created_at    as to_escalation,
       acknowledged_at - created_at as to_officer_ack,
       resolution
from alerts
where user_id = (select id from profiles where email = '<patient email>')
order by created_at desc
limit 20;

-- What the officer dashboard believes about the patient's devices.
select * from device_status
where user_id = (select id from profiles where email = '<patient email>');
```

## A. Apple Watch connection

| ID | Steps | Expected | Pass criteria |
|---|---|---|---|
| A1: first connect | Fresh install on the patient iPhone. Sign in. In onboarding's watch step, tap **Allow Health Access** and turn on every category. Wear the watch, open the Heart Rate app on it, then tap **Check Again**. | The step shows "✓ Receiving data from *Your Apple Watch*". | The source name is the watch, not "Health". `device_status.watch_ok = true` and `watch_name` matches. |
| A2: manual entries rejected | In a **release** build (`npx expo run:ios --configuration Release`), add a manual heart rate of 70 in the Health app. | It's ignored: no `vitals` row has `source = 'manual'`. In a dev build it's accepted but tagged, and the officer card shows **MANUAL ENTRY**. | Release: zero `manual` rows. Dev: every such row is tagged. |
| A3: watch removed | Set `WATCH_STALE_MINUTES` to 5 for this run. Take the watch off (or put it on the charger). After 5 minutes, bring the app to the foreground. | Re-onboarding: "Your Apple Watch disconnected". Within one poll (≤ 5 s) the officer card shows **Watch not reporting**. | Detected on the first foreground after the threshold. The officer chip appears. |
| A4: recovery | Put the watch back on and open the Heart Rate app on it. In the app, tap **Check Again**. | Returns to the app. The officer's chip clears. | ≤ 1 minute after the watch reading syncs. |
| A5: Health access revoked | Go to **Settings › Health › Data Access & Devices › Haven Monitor** and turn off Heart Rate. Return to the app. | iOS hides read denials, so it shows as "no data", and the watch step returns on this or the next foreground. | Detected without a restart. |
| A6: location revoked | Set **Settings › Haven Monitor › Location → Never**, then return to the app. | Immediate re-onboarding: "Location is off". The officer card shows **Location permission off**. Turning it back on in Settings and returning moves past the step automatically. | Both directions work, with no manual refresh. |

## B. Live data to the officer

Latency breaks down into these stages:

| Stage | Timestamp or bound |
|---|---|
| Watch measures a sample | `sampled_at` |
| Sample syncs to the iPhone's HealthKit | Not directly observable |
| App reads HealthKit | Polls every `HEALTHKIT_POLL_INTERVAL_MS` = 5 s |
| Row inserted on the server | `recorded_at` |
| Officer screen updates | Realtime (~1 s), or ≤ 5 s by polling |

| ID | Steps | Measure | Target |
|---|---|---|---|
| B1: pipeline latency | Use the Demo sheet on the patient. Alternate Normal ↔ Elevated 20 times. Screen-record both phones side by side. | Time from the tap to the officer card changing (frame count). | p50 ≤ 2 s, p95 ≤ 5 s. |
| B2: real watch, everyday wear | Wear the watch normally for 1 hour with the patient app open and the phone unlocked. | `watch_to_server` from the first query, and the gaps between successive `sampled_at` values. | Report it; no target. Expect minutes between samples. That is the watch's cadence, not the app's. |
| B3: real watch, workout | Start an Outdoor Walk workout on the watch for 15 minutes. | Same as B2. | Report p50/p95. Expect seconds to about a minute. |
| B4: app backgrounded | Lock the patient iPhone for 5 minutes. | The officer card shows **App offline** after `APP_OFFLINE_AFTER_MS` = 60 s. | **Expected to fail today:** no data arrives while locked. This documents the background-delivery gap. It passes once background delivery is built. |
| B5: network loss | Put the patient iPhone in airplane mode for 2 minutes, then reconnect. | Gap in `vitals`, then recovery. | Recovers within one heartbeat. Samples from the gap are **not** backfilled today; record the gap. |

## C. Elevated state → call to the officer

"Elevated" is heart rate > 100, SpO₂ < 94 or respiratory rate > 20 (`classifyVitals`). A tester can reach it safely with a minute of stair climbing or jumping jacks on a real watch. **Never induce the critical ranges** (heart rate < 50, SpO₂ < 85, respiratory rate < 9). Test those with the Demo sheet only.

| ID | Steps | Expected | Pass criteria |
|---|---|---|---|
| C1: officer app open, demo | Officer app in the foreground on any tab. On the patient: **Demo → Elevated**. | The officer phone vibrates and shows a notification plus the full-screen alert with name, time, location and Call / Acknowledge. Tapping **Acknowledge** shows "Seen by officer HH:MM" on the patient's Alerts tab. | `to_officer_ack` is recorded. Takeover appears ≤ 5 s after `created_at`. |
| C2: officer app open, real watch | As C1, but raise the tester's heart rate above 100 with exercise instead of using Demo. | Same as C1. | End-to-end time from the elevated reading to the takeover. Report p50/p95 over 5 trials. |
| C3: no response | **Demo → Overdose**, then don't touch the patient phone. | After 30 s: "Alert Escalated" on the patient. `escalated_at` is set. The officer alert says "Patient didn't respond". | `to_escalation` ≈ 30–31 s. |
| C4: officer app closed | As C1 with the officer app force-quit, then with the phone locked. | **Expected to fail today:** nothing reaches the officer until they open the app. On opening, the unacknowledged alert pops immediately. | Documents the gap. The build spec below closes it. |
| C5: phone call (after C4 build) | Trigger C1, C2 and C3 with the officer app closed. | The officer's phone rings within seconds, a spoken summary plays, and pressing 1 acknowledges. | p95 time from `created_at` to ringing ≤ 15 s (Twilio call logs record the ringing time). Exactly one call per alert. |

### C4 build spec: calling the officer

1. **Officer phone number.** Add a `parole_officers.phone` column. Add a settings row in the officer's Settings for "Alert callback number", verified by SMS code.
2. **Trigger.** Add a Supabase Database Webhook on `alerts` INSERT, plus UPDATE of `escalated_at`, that calls an Edge Function `notify-officer`.
3. **Edge Function.** Look up the patient's officer and phone number. Place a call with Twilio Programmable Voice, reading the patient's name, severity and nearest address with text-to-speech. A keypress of 1 calls `acknowledge_alert` through a signed callback. Record the call SID and status on the alert so it's called only once.
4. **Escalation policy.** Recommendation: elevated sends a push notification, and a call is placed for critical or escalated alerts, to avoid call fatigue. This is a product decision to make before building.
5. **Push notifications as the lighter path.** Set up an APNs key through EAS credentials. Register officers' Expo push tokens, and have the same Edge Function send a push. This needs an Apple Developer account.
6. **Credentials.** The Twilio account SID, auth token and caller number go in Edge Function secrets, never in the app. A Twilio trial account can only call verified numbers, which is fine for testing.

## Safety rules for test sessions

- `EXPO_PUBLIC_EMERGENCY_NUMBER` must point at a team phone. Check it before every session.
- Critical physiology is only ever simulated.
- Alerts and vitals from the Demo sheet are tagged `demo` and badged **DEMO** for the officer. Real-watch runs must show no badge.
- Clear test alerts between runs with the SQL editor (as the project owner). The app can't delete them.

## Results log

| Test | Date | Build | Devices / watchOS | Result | Latency p50 / p95 | Notes |
|---|---|---|---|---|---|---|
| | | | | | | |
