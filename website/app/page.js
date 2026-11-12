import Link from "next/link";
import { SITE } from "./site";

const FEATURES = [
  {
    color: "var(--green)",
    title: "Continuous monitoring",
    body: "Pairs with a compatible wearable, such as a Garmin watch, to read heart rate, blood oxygen, and other vitals.",
  },
  {
    color: "var(--amber)",
    title: "Personal baseline",
    body: "Learns what normal looks like for you, so warnings are based on your body rather than a generic threshold.",
  },
  {
    color: "var(--red)",
    title: "Fast alerts",
    body: "When readings suggest a possible overdose, Haven alerts your emergency contacts and, if you have one, your assigned officer.",
  },
];

export default function Home() {
  return (
    <div className="container">
      <section className="hero">
        <img src="/icon.png" alt="Haven app icon" />
        <h1>Help, when it matters most.</h1>
        <p>
          {SITE.appName} uses wearable biometrics to spot the warning signs of a possible
          opioid overdose and alert the people who can help.
        </p>
        <span className="pill">Coming soon to iOS and Android</span>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <div className="card" key={f.title}>
            <span className="dot" style={{ background: f.color }} />
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <div className="notice">
        <strong>Haven is not a medical device and does not call 911.</strong> It can miss an
        overdose or alert when none is happening. If you think someone is overdosing, call 911
        and give naloxone (Narcan) if you have it.
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 56 }}>
        Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. Read our{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Use</Link>.
      </p>
    </div>
  );
}
