import Link from "next/link";
import { faqArticles, faqIndexCopy, faqIndexPaths } from "@/app/faq/articles";
import { toolPaths } from "@/app/tools/ask-jev-trading/content";
import { toolPaths as polymarketPaths } from "@/app/tools/polymarket/content";
import type { Locale } from "@/lib/i18n";
import styles from "./SiteFooter.module.css";

export default function SiteFooter({ locale }: { locale: Locale }) {
  // Only count real pages in the reader's language, including for the More link.
  const localizedArticles = faqArticles.filter((article) => article.paths[locale]);
  const articles = localizedArticles.slice(0, 3);
  const faqPath = faqIndexPaths[locale];

  return (
    <footer className={styles.footer}>
      <nav className={styles.columns} aria-label="FAQ, Tools, Legal">
        <section aria-labelledby="footer-faq">
          <h2 id="footer-faq"><Link href={faqPath}>FAQ</Link></h2>
          <ul data-faq-articles>
            {articles.map((article) => (
              <li key={article.id}><Link href={article.paths[locale]!}>{article.title[locale]}</Link></li>
            ))}
          </ul>
          {localizedArticles.length > 3 && <Link className={styles.more} href={faqPath}>{faqIndexCopy[locale].more}</Link>}
        </section>
        <section aria-labelledby="footer-tools">
          <h2 id="footer-tools">Tools</h2>
          <ul>
            <li><Link href={toolPaths[locale]}>Ask Jev Trading</Link></li>
            <li><Link href={polymarketPaths[locale]}>Jev for Polymarket</Link></li>
          </ul>
        </section>
        <section aria-labelledby="footer-legal">
          <h2 id="footer-legal">Legal</h2>
          <ul>
            <li><Link href="/terms-of-service" hrefLang="en" lang="en">Terms of Service</Link></li>
            <li><Link href="/privacy-policy" hrefLang="en" lang="en">Privacy Policy</Link></li>
          </ul>
        </section>
      </nav>
      <div className={styles.sourceLinks}>
        <Link href="/about" hrefLang="en" lang="en">About Jev Trader</Link>
        <a href="https://github.com/web3w/jev-trader">GitHub · web3w/jev-trader</a>
        <a href="https://github.com/jarrodwatts/jev-trader">Upstream · jarrodwatts/jev-trader</a>
      </div>
    </footer>
  );
}
