import type { Metadata } from "next";
import Link from "next/link";

const title = "Privacy Policy | Jev Trader";
const description = "How Jev Trader's current website uses browser language preferences, market requests and infrastructure logs, with information about external services and privacy choices.";
const canonical = "https://jev-trader.com/privacy-policy";

export const metadata: Metadata = {
  title, description,
  robots: { index: false, follow: true },
  alternates: { canonical },
  openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url: canonical, siteName: "Jev Trader", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
};

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p>This draft describes the data flows implemented for jev-trader.com. It covers browsing the website, viewing its public market demonstrations and using Ask Jev Trading. It does not cover independently operated exchanges, AI providers or linked websites.</p>
      <section id="operator">
        <h2>1. Who is responsible</h2>
        <p>Jev Trader is operated by an individual based in Singapore.</p>
        <p>For privacy questions or requests, contact <a href="mailto:dev@jevm.ai">dev@jevm.ai</a>.</p>
        <p>The individual operator’s legal name remains to be confirmed before this draft becomes a published privacy notice.</p>
      </section>
      <section id="information">
        <h2>2. Information involved in using the website</h2>
        <ul>
          <li><strong>Request information.</strong> Serving pages and API connections involves network information such as an IP address and request details. The deployment configuration enables web-server access and error logs; their exact fields and retention need operator confirmation. Hosting and delivery providers may also process request metadata.</li>
          <li><strong>Language preference.</strong> The browser stores your selected language under <code>jev-trader-language</code> in localStorage. The application uses it to restore a reading preference; it does not intentionally send that stored value to the trading API.</li>
          <li><strong>Market selection.</strong> A dashboard sends the selected venue to the configured market API and opens a connection for market updates. A selection may start a shared simulation, rather than create a private account or personal trading session.</li>
          <li><strong>Public market and model information.</strong> Dashboards may show public market activity, model inputs and outputs, simulation records and operator-configured public wallet identifiers. These records are not evidence that the visitor owns a wallet or placed a trade.</li>
        </ul>
        <p>The current website has no registration, payment or visitor-wallet connection form. It does not ask for a name, password, payment-card number, seed phrase or private key.</p>
      </section>
      <section id="purpose">
        <h2>3. Why this information is used</h2>
        <p>Request information is used to deliver pages and live updates, diagnose failures and protect the service. The language preference supports your reading choice. Market selections determine which public demonstration the dashboard displays.</p>
        <p>The current application does not implement advertising profiles or visitor-based credit, eligibility or investment decisions. Its AI examples evaluate market states and teaching examples, not a visitor’s personal financial situation.</p>
      </section>
      <section id="storage">
        <h2>4. Browser storage and analytics</h2>
        <p>The application uses localStorage for language preferences and does not implement application-level advertising cookies or analytics trackers. This statement does not rule out cookies or logging introduced by the production hosting, CDN or security configuration, which must be checked before publication.</p>
        <p>You can remove the language preference by clearing this site’s browser data or block local storage through browser settings. The preference has no application-defined expiry; clearing it may reset the interface language. FAQ article language is determined by its URL.</p>
      </section>
      <section id="providers">
        <h2>5. Infrastructure and external services</h2>
        <p>Hosting, reverse-proxy and content-delivery services process requests needed to serve the site. The market API can be hosted separately from the frontend, so the browser connects to the API host configured for that deployment.</p>
        <p>Server-side integrations retrieve market data from Hyperliquid and Monad/Kuru infrastructure. When the Jev model is enabled, the backend sends market state and evaluation questions to TypeSafe AI. The current evaluation request is not designed to include browser language preferences or visitor identification.</p>
        <p>Following an external link sends a request to that website, which handles information under its own policy. Provider identities, processing locations and any required international-transfer safeguards must be confirmed for the production deployment; this draft does not promise data residency or provider retention limits.</p>
      </section>
      <section id="ask-jev-trading">
        <h2>Ask Jev Trading</h2>
        <p>Ask Jev Trading is currently an educational prototype. Submitting a question sends the question, market snapshot and options or rating levels to our frontend service, which generates random demonstration data in Jev’s output format. It does not call TypeSafe AI, use a model credential, retrieve account details or place orders. Its application code does not persist these inputs or log request bodies; infrastructure logging remains subject to its own configuration.</p>
        <p>Sharing is optional and includes only the displayed conclusion and its mock or model source label. It excludes the question, market snapshot, full probability distribution and raw response. A Choice conclusion includes the selected option text, so review it before sharing. Shared conclusions are encoded in the URL fragment, are readable by anyone with the link, and are not stored in a sharing database. They can be modified by the sender and are shown as unverified. Copying a conclusion or link does not publish it automatically.</p>
      </section>
      <section id="retention">
        <h2>6. Retention and security</h2>
        <p>Language preferences remain in the browser until removed. Dashboard history and server-side trading records have separate lifecycles from website access logs. A trading-log rotation setting is not a retention period for visitor data.</p>
        <p>Access-log and provider-log retention periods, backup handling and deletion procedures are pending confirmation. Private keys and service API credentials belong on the server and should never be submitted by visitors. No internet service can guarantee absolute security.</p>
      </section>
      <section id="choices">
        <h2>7. Your choices and privacy requests</h2>
        <p>You can clear local browser data, close the page to end its active market connection and choose whether to follow external links. Depending on applicable law, you may have rights to access, correct, delete or obtain your personal data, restrict or object to processing, and complain to a relevant supervisory authority.</p>
        <p>Send privacy requests to <a href="mailto:dev@jevm.ai">dev@jevm.ai</a>. Applicable processing grounds, any consent requirements and response procedures require confirmation for the operator’s jurisdiction. Do not post personal information or credentials in public issue trackers to make a privacy request.</p>
      </section>
      <section id="changes">
        <h2>8. Changes and related terms</h2>
        <p>This notice should be reviewed when accounts, analytics, new providers or other data collection are introduced. A published revision should state an accurate update date and explain material changes. See also the <Link href="/terms-of-service">Terms of Service</Link>.</p>
      </section>
    </article>
  );
}
