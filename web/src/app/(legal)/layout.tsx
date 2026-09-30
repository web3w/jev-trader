"use client";

import Link from "next/link";
import { useEffect } from "react";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import styles from "./legal.module.css";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  // Restore the document language after client navigation from a translated FAQ.
  useEffect(() => { document.documentElement.lang = "en"; }, []);

  return (
    <div className={styles.page} lang="en">
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <nav aria-label="Legal pages">
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <p className={styles.eyebrow}>LEGAL · ENGLISH</p>
        <aside className={styles.notice}>
          Local review draft. The operator’s legal name and deployment-specific privacy information must be confirmed before publication. These documents are not yet effective terms or a final privacy notice.
        </aside>
        {children}
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}
