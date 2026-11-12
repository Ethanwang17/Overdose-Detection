import Link from "next/link";
import { SITE } from "../site";

export const metadata = {
  title: "Terms of Use",
  description: `Terms of Use for the ${SITE.appName} app.`,
};

const mail = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

export default function Terms() {
  return (
    <article className="container legal">
      <h1>Terms of Use</h1>
      <p className="meta">Effective {SITE.effectiveDate}</p>

      <p>
        These terms are an agreement between you and {SITE.company} (&ldquo;we&rdquo; or
        &ldquo;us&rdquo;) for your use of the {SITE.appName} app and website. By using{" "}
        {SITE.appName}, you agree to these terms and to our{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use{" "}
        {SITE.appName}.
      </p>

      <div className="callout">
        <strong>Haven is not a medical device and is not an emergency service.</strong> It does not
        call 911, diagnose any condition, or treat or prevent an overdose. It can miss an overdose,
        alert too late, or alert when nothing is wrong. Wearable readings can be inaccurate, and
        alerts depend on your phone, your wearable, battery, and network connection. Never rely on
        Haven alone. In an emergency, call 911 and give naloxone (Narcan) if you have it.
      </div>

      <h2>1. Eligibility</h2>
      <p>
        If you are under 18, a parent or legal guardian must agree to these terms on your behalf
        and is responsible for your use of {SITE.appName}.
      </p>

      <h2>2. Your account</h2>
      <p>
        Give accurate information and keep your login details private. You are responsible for
        activity on your account. Tell us right away at {mail} if you think someone else has
        accessed it.
      </p>

      <h2>3. Emergency contacts and officers</h2>
      <p>
        You confirm that you have permission to add each emergency contact and that they agree to
        receive alerts from {SITE.appName}. If you link a supervising officer, you agree that the
        officer can see the information described in our Privacy Policy. Officers who use{" "}
        {SITE.appName} must use it only for their official duties and follow their agency&rsquo;s
        rules and applicable law.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use {SITE.appName} to track or monitor someone without their knowledge and lawful consent.</li>
        <li>Tamper with, spoof, or falsify readings, location, or alerts.</li>
        <li>Try to access data or accounts that are not yours, or bypass security controls.</li>
        <li>Reverse engineer, overload, or interfere with the service.</li>
        <li>Use {SITE.appName} for anything illegal.</li>
      </ul>

      <h2>5. Third-party devices and services</h2>
      <p>
        {SITE.appName} works with wearables and services from other companies, such as Garmin. Those
        products have their own terms. We are not responsible for how they work, whether they are
        available, or how accurate their data is.
      </p>

      <h2>6. Our rights</h2>
      <p>
        We own {SITE.appName} and its content. We grant you a personal, non-transferable license to
        use the app while these terms are in effect. We may change, suspend, or discontinue
        features. We will try to give you notice before any change that would stop alerts from
        working.
      </p>

      <h2>7. Ending your use</h2>
      <p>
        You can stop using {SITE.appName} and delete your account at any time. We may suspend or
        close accounts that break these terms. Sections 8 to 10 still apply after your use ends.
      </p>

      <h2>8. Disclaimer of warranties</h2>
      <p>
        To the fullest extent the law allows, {SITE.appName} is provided &ldquo;as is&rdquo; and
        &ldquo;as available,&rdquo; without warranties of any kind, express or implied, including
        warranties of merchantability, fitness for a particular purpose, accuracy, and
        non-infringement. We do not promise that {SITE.appName} will detect every overdose, deliver
        every alert, or run without interruption.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent the law allows, {SITE.company} will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or for any injury or death
        resulting from a missed, delayed, or false alert. Our total liability for any claim
        relating to {SITE.appName} is limited to the greater of the amount you paid us in the past
        12 months or US $50. Some places do not allow these limits, so they may not fully apply to
        you.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of the State of {SITE.state}, without regard to its
        conflict-of-law rules. Disputes will be resolved in the state or federal courts located in{" "}
        {SITE.state}, unless the law where you live requires otherwise.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these terms. We will post changes here and update the effective date, and we
        will notify you in the app if a change is significant. If you keep using {SITE.appName}{" "}
        after a change, you accept the updated terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        {SITE.company}, {SITE.state}, United States · {mail}
      </p>
    </article>
  );
}
