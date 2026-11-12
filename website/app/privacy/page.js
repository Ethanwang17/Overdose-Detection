import { SITE } from "../site";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.company} collects, uses, and protects your information in the ${SITE.appName} app.`,
};

const mail = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

export default function Privacy() {
  return (
    <article className="container legal">
      <h1>Privacy Policy</h1>
      <p className="meta">Effective {SITE.effectiveDate}</p>

      <p>
        {SITE.company} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) makes {SITE.appName}, a
        mobile app that reads data from a wearable device to detect possible signs of an overdose
        and alert other people. This policy explains what we collect, why, who can see it, and the
        choices you have. It also serves as our <strong>Consumer Health Data Privacy Policy</strong>{" "}
        under Washington&rsquo;s My Health My Data Act (see{" "}
        <a href="#consumer-health-data">Section 9</a>).
      </p>

      <div className="callout">
        <strong>Short version:</strong> We collect health and location data so Haven can work. We
        never sell your data or use it for advertising. Your emergency contacts receive alerts, and
        if you link a supervising officer, that officer can see your vitals, location, and alerts.
        You can ask us to delete your data at any time.
      </div>

      <nav className="toc" aria-label="Contents">
        <strong>Contents</strong>
        <ol>
          <li><a href="#collect">Information we collect</a></li>
          <li><a href="#use">How we use it</a></li>
          <li><a href="#share">Who can see it</a></li>
          <li><a href="#garmin">Wearable and Garmin data</a></li>
          <li><a href="#retention">How long we keep it</a></li>
          <li><a href="#security">Security</a></li>
          <li><a href="#children">Children and teens</a></li>
          <li><a href="#rights">Your choices and rights</a></li>
          <li><a href="#consumer-health-data">Washington consumer health data</a></li>
          <li><a href="#changes">Changes and contact</a></li>
        </ol>
      </nav>

      <h2 id="collect">1. Information we collect</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Examples</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account information</td>
              <td>Name, email address, password (stored hashed), role (participant or officer), date of birth</td>
              <td>You</td>
            </tr>
            <tr>
              <td>Biometric and health data</td>
              <td>Heart rate, heart rate variability, blood oxygen (SpO₂), respiration, stress, sleep and activity readings, your personal baseline, and alerts Haven generates</td>
              <td>Your wearable device and our analysis of its readings</td>
            </tr>
            <tr>
              <td>Location data</td>
              <td>Your device&rsquo;s precise location, collected while monitoring is on</td>
              <td>Your phone</td>
            </tr>
            <tr>
              <td>Emergency contacts</td>
              <td>Name, relationship, phone number, and email of people you or your officer add</td>
              <td>You or your assigned officer</td>
            </tr>
            <tr>
              <td>Supervision link</td>
              <td>The invite code you enter and the officer it links you to</td>
              <td>You</td>
            </tr>
            <tr>
              <td>Device and settings</td>
              <td>Paired wearable model and identifier, app settings, notification tokens</td>
              <td>Your phone and wearable</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        We do not use advertising trackers or third-party analytics, and we do not collect your
        contacts list, photos, or messages.
      </p>

      <h2 id="use">2. How we use it</h2>
      <ul>
        <li>To monitor your vitals, build your personal baseline, and detect readings that may indicate an overdose.</li>
        <li>To send alerts, with your location, to your emergency contacts and to your linked officer, if you have one.</li>
        <li>To show you your history and let you export it.</li>
        <li>To run, secure, troubleshoot, and improve Haven, including improving detection accuracy.</li>
        <li>To comply with the law and respond to valid legal process.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal data, share it for targeted advertising, or
        use it to build advertising profiles.
      </p>

      <h2 id="share">3. Who can see it</h2>
      <h3>Your emergency contacts</h3>
      <p>
        When Haven detects a possible overdose, the contacts on your account receive an alert that
        includes your name, the type of alert, the time, and your location.
      </p>
      <h3>Your supervising officer (only if you link one)</h3>
      <p>
        Some people use Haven as part of probation, parole, or another supervision program. If you
        enter an officer invite code, the officer assigned to you can see your profile, biometric
        readings, location, alerts, and emergency contacts, and can manage your emergency contacts.
        Officers can only see people assigned to them. Their agency&rsquo;s own policies govern
        what that agency does with information after an officer views it. We do not control those
        policies.
      </p>
      <div className="callout">
        Haven does not decide whether you have to use it. Questions about whether using Haven is
        required as part of your supervision should go to your officer or the court.
      </div>
      <h3>Service providers</h3>
      <p>
        We store data with Supabase, our database and authentication provider, which processes it
        only on our instructions. Our website is hosted by Vercel. If you connect a wearable, the
        wearable maker (such as Garmin) shares data with us under its own privacy policy.
      </p>
      <h3>Legal and safety reasons</h3>
      <p>
        We may disclose information if a valid subpoena, court order, or other legal process
        requires it, or if we believe in good faith that disclosure is needed to prevent death or
        serious harm. If we are allowed to, we will notify you before responding to a legal demand
        for your data.
      </p>
      <h3>Business transfers</h3>
      <p>
        If {SITE.company} is involved in a merger, acquisition, or asset sale, your information may
        transfer under this policy, and we will notify you before it falls under a different
        policy.
      </p>

      <h2 id="garmin">4. Wearable and Garmin data</h2>
      <p>
        If you connect a Garmin account, you authorize Garmin to share health and activity data
        from your device with Haven. We use that data only to provide Haven&rsquo;s monitoring and
        alert features as described in this policy. We do not sell it, use it for advertising, or
        share it with anyone other than the people described in Section 3. You can disconnect at any time in
        Haven&rsquo;s settings or in Garmin Connect, and we will stop receiving new data from that
        point on. To have data we already received deleted, see Section 8.
      </p>

      <h2 id="retention">5. How long we keep it</h2>
      <ul>
        <li><strong>Raw biometric readings and location:</strong> up to 90 days, then deleted.</li>
        <li><strong>Alerts and the readings and location attached to them:</strong> up to 2 years, so you and your officer can review past events.</li>
        <li><strong>Account information, baseline, and contacts:</strong> for as long as your account is active.</li>
        <li><strong>After you delete your account:</strong> we delete or de-identify your data within 30 days, except where the law requires us to keep it longer. Backups are overwritten within a further 30 days.</li>
      </ul>

      <h2 id="security">6. Security</h2>
      <p>
        Data is encrypted in transit (TLS) and at rest. Database access rules limit each person to
        their own data, plus the people assigned to an officer. No system is perfectly secure. If a
        breach affects your information, we will notify you as the law requires.
      </p>

      <h2 id="children">7. Children and teens</h2>
      <p>
        Haven may be used by people under 18. A parent or legal guardian must agree to this policy
        and the Terms of Use on behalf of anyone under 18. We do not knowingly collect personal
        information from a child under 13 without verifiable consent from a parent or guardian. If
        we learn that we have, we will delete it. Parents and guardians can review, change, or
        delete a minor&rsquo;s information, or stop further collection, by emailing {mail}.
      </p>

      <h2 id="rights">8. Your choices and rights</h2>
      <p>Wherever you live, you can:</p>
      <ul>
        <li><strong>Access</strong> your data, or get a copy of it (you can also export your history in the app).</li>
        <li><strong>Correct</strong> inaccurate information.</li>
        <li><strong>Delete</strong> your account and data.</li>
        <li><strong>Withdraw consent</strong> by turning off monitoring, revoking location or health permissions in your phone settings, or disconnecting your wearable.</li>
      </ul>
      <p>
        Email {mail} from your account email to make a request. We will verify your identity and
        respond within 45 days. If we deny a request, you can appeal by replying to our decision,
        and we will respond to the appeal within 45 days. If you are still unsatisfied, you can
        contact the Washington State Attorney General at{" "}
        <a href="https://www.atg.wa.gov/file-complaint" rel="noopener noreferrer">atg.wa.gov</a>.
        We will not treat you differently for exercising these rights.
      </p>
      <p>
        If you are under supervision, deleting your data or turning off monitoring may affect your
        program. Haven will still honor your request, but you may want to talk with your officer first.
      </p>

      <h2 id="consumer-health-data">9. Washington Consumer Health Data Privacy Policy</h2>
      <p>
        This section is our consumer health data privacy policy under Washington&rsquo;s My Health
        My Data Act (RCW 19.373). It applies to consumers in Washington, and we apply the same
        protections to all Haven users.
      </p>
      <ul>
        <li>
          <strong>Consumer health data we collect:</strong> biometric readings (heart rate, heart
          rate variability, blood oxygen, respiration, stress, sleep, activity), your personal
          baseline, overdose-risk alerts and inferences, and precise location, which can show
          that you are seeking health services.
        </li>
        <li>
          <strong>Why we collect and use it:</strong> to detect possible overdoses, alert your
          contacts and linked officer, show you your history, and keep Haven safe and working
          (Sections 1 and 2).
        </li>
        <li>
          <strong>Sources:</strong> your wearable device, your phone, information you enter, and our
          analysis of those readings.
        </li>
        <li>
          <strong>Who we share it with:</strong> your emergency contacts, your linked supervising
          officer if you have one, our processors Supabase and Vercel, and others only when the law
          requires it (Section 3).
        </li>
        <li>
          <strong>Consent:</strong> we collect and share consumer health data only with your consent,
          or as needed to provide the service you asked for. We ask for separate consent before
          sharing it with your officer.
        </li>
        <li>
          <strong>Sale:</strong> we do not sell consumer health data.
        </li>
        <li>
          <strong>Geofencing:</strong> we do not set up geofences around places where health care
          is provided.
        </li>
        <li>
          <strong>Your rights:</strong> you can confirm whether we collect your health data, access
          it, see a list of everyone we have shared it with, withdraw consent, and have it deleted
          (Section 8). To make a request, email {mail}.
        </li>
      </ul>

      <h2 id="changes">10. Changes and contact</h2>
      <p>
        We will post any changes on this page and update the effective date. If we make a material
        change, especially to how we share health data, we will notify you in the app and ask for
        your consent again where the law requires it.
      </p>
      <p>
        {SITE.company}
        <br />
        {SITE.state}, United States
        <br />
        {mail}
      </p>
    </article>
  );
}
