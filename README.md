# Overdose Detection — Biometric Health Tracking App

A React Native application that monitors wearable biometric data to detect potential overdose events and trigger real-time alerts.

## Project Overview

| | |
|---|---|
| **Platform** | Android MVP → iOS |
| **Tech** | React Native |
| **Budget** | $30,000 |
| **Team** | 4 developers (including design and PM) |

## Core Features

- **Wearable Integration** — Pulls real-time health metrics (e.g., heart rate) from Fitbit via API
- **Dashboard** — Displays live and historical biometric data with charts and graphs
- **Alerts** — Detects outlier health events and triggers push notifications (e.g., possible overdose)
- **User Accounts** — Authentication, onboarding, and profile management
- **Monetization** — Subscription tier and in-app purchase support (free vs. premium)

> **Note:** Algorithm development, business planning, and legal matters are outside the development scope. Algorithm accuracy is not developer responsibility.

---

## 6-Month Roadmap

### Month 1 — Foundations + Setup
- Finalize feature specs and user flow diagrams
- Set up GitHub repo, CI/CD pipelines, and branch strategy
- Configure cloud backend (Firebase / AWS) for auth and database
- Build basic UI skeleton (login, dashboard, account, alerts/settings)
- Begin IoT wearable API integration research and prototyping
- Define database schema for health metrics

**Milestones:** Project plans and tech architecture approved · UX/UI design complete · Dummy Fitbit data retrieval working

---

### Month 2 — Core Android MVP Development
- Full authentication with backend (email/password or Google sign-in)
- Complete Fitbit API data sync (heart rate, etc.)
- Dashboard page pulling and displaying real user metrics
- Health history log (7+ days of stored metrics)
- Basic alerts UI and storage of outlier events

**Milestones:** User login and account creation working · Dashboard populated with real Fitbit data · Health metric history view available

> **Risk:** Wearable API rate limits or permission scope restrictions

---

### Month 3 — Polish MVP + Monetization Planning
- Push notification support (e.g., possible overdose alerts)
- Refined dashboard with data visualizations (charts/graphs)
- Onboarding tutorial for new users
- UX polish (loading states, error handling)
- Feature flags to separate free vs. premium users
- Research and document monetization options (subscription tier, in-app purchases)

**Milestones:** MVP feature complete · Monetization plan drafted and feature flags ready

---

### Month 4 — QA, Android Launch + iOS Planning
- Internal beta testing (QA and bug fixes)
- External beta via Google Play Beta Test Group
- Publish Android MVP to Google Play Store
- Collect early user feedback
- Architecture planning for iOS (shared backend, code reuse)

**Milestones:** Android MVP launched publicly · iOS tech plan completed

> **Note:** QA and bug fixing should be a 2–3 week sprint

---

### Month 5 — iOS Kickoff + Android Monetization *(Buffer Month)*
- Set up iOS app architecture (Swift/SwiftUI)
- Basic login/signup flow for iOS
- Fitbit API integration on iOS
- Implement subscription screen and in-app purchases for Android
- Google Play Console setup for payments

**Milestones:** iOS development active · Android app updated with premium upgrade option

---

### Month 6 — iOS Development Continued + Risk Management *(Buffer Month)*
- iOS dashboard pulling Fitbit data
- iOS health history log screen
- Coordinate with medical professionals to review health data outputs
- Handle urgent Android production hotfixes as needed

**Milestones:** iOS core features (data fetch, dashboard) complete or near-complete · No critical production issues on Android

> **Note:** If Android production bugs are major, iOS development may slow. Keep documentation updated for eventual App Store submission.

---

## Risks & Mitigations

| Dependency | Risk | Mitigation |
|---|---|---|
| Fitbit API stability/limits | Quota exhaustion or data field changes | Cache data intelligently; warn users if sync is unavailable |
| iOS HealthKit access | Complex Apple HealthKit permissions | Start with Fitbit-only MVP; add Apple Watch support later |
| Medical algorithm validation | Algorithms could be wrong or misleading | Developers are not liable for medical validation |
| Monetization approval | Google/Apple may reject monetization plans | Follow platform guidelines strictly; implement early |
| Budget overrun | Unexpected bug fixes or tech debt | Monitor burn rate; use free/low-cost tooling where possible |

---

## Team

**Gagan Singh** — Technical Program Manager, Microsoft
- Background in product management, AI, and network infrastructure
- Led product on *Mindscape*, an AI app using biometric data for mental health insights
- Experience at Microsoft, Cisco Meraki, and Amazon
- B.S. Informatics & B.A. Business, University of Washington; pursuing M.S. CS, Georgia Tech

**Ethan Wang** — Full-Stack Developer, TSMC
- Frontend/backend engineering, UI design, and data applications
- Led frontend for *Mindscape*; built .NET systems for TSMC and Hanford cleanup
- Experience in health tech and clean energy sectors
- B.S. Informatics, University of Washington

**Viru Repalle** — Cybersecurity Researcher, PNNL
- Builds secure software for national critical infrastructure resilience
- Skilled in React, software engineering, and cybersecurity frameworks (C2M2)
- B.S. Informatics, University of Washington; pursuing M.S. Cybersecurity, Georgia Tech

**Sachin Dhami** — Technical PM & HCI Researcher, Gekko Corporation
- Focus on Human-Computer Interaction and inclusive UX design
- Led development at Gekko Corp; researched generative AI in UX at UW
- Experience across UX research, product, and engineering roles
- B.S. Informatics, University of Washington
