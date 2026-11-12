import Link from "next/link";
import "./globals.css";
import { SITE } from "./site";

export const metadata = {
  title: {
    default: "Haven — Overdose detection and alerts",
    template: "%s · Haven",
  },
  description:
    "Haven uses wearable biometrics to detect signs of a possible overdose and alert the people who can help.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              <img src="/logo.svg" alt="" />
              {SITE.appName}
            </Link>
            <nav className="nav">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">
            <div className="links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/privacy#consumer-health-data">Consumer Health Data Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
              <a href={`mailto:${SITE.email}`}>Contact</a>
            </div>
            © {new Date().getFullYear()} {SITE.company}. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
