import type { Metadata } from "next";
import Link from "next/link";

const title = "Terms of Service | Jev Trader";
const description = "Terms for using Jev Trader's market dashboards, AI decision examples and educational content, including simulation limitations and acceptable use.";
const canonical = "https://jev-trader.com/terms-of-service";

export const metadata: Metadata = {
  title, description,
  robots: { index: false, follow: true },
  alternates: { canonical },
  openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url: canonical, siteName: "Jev Trader", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
};

export default function TermsPage() {
  return (
    <article>
      <h1>Terms of Service</h1>
      <p>These draft terms describe the intended conditions for using jev-trader.com, including its market dashboards, model explanations and FAQs. They apply to this website, not to separately operated exchanges, blockchains or AI services.</p>
      <section id="service">
        <h2>1. What Jev Trader provides</h2>
        <p>Jev Trader presents market data, trading-decision examples and educational explanations of Jev. The current interface covers Hyperliquid HYPE/USDC and Kuru MON/USDC. Model and execution labels identify the configuration shown; a mock model is not a Jev inference.</p>
        <p>The website does not provide visitor accounts, accept deposits or ask visitors to connect a wallet. Opening a market page can start a shared server-side simulation. It does not authorize a trade using a visitor’s assets. The underlying software also supports operator-configured live execution; a simulation must not be represented as an actual on-chain trade.</p>
      </section>
      <section id="risk">
        <h2>2. Educational information and trading risk</h2>
        <p>Content and model outputs are provided for information and experimentation, not as personalized investment advice or a recommendation to buy or sell an asset. No return, execution outcome or level of accuracy is promised.</p>
        <p>Simulated fills, balances and profit or loss are hypothetical. They may differ from real execution because of liquidity, fees, latency, slippage and other market conditions. A score, probability or confidence value does not establish that a prediction is correct. Verify sources and consider your own circumstances before making any independent financial decision.</p>
      </section>
      <section id="acceptable-use">
        <h2>3. Acceptable use</h2>
        <p>Use the service lawfully. Do not attempt unauthorized access, interfere with other visitors, overload endpoints, bypass access controls or submit malicious content. Do not misrepresent simulated results, model outputs or third-party content as verified investment performance.</p>
        <p>Public access does not grant permission to access credentials, private infrastructure or restricted data. Access may be restricted to address abuse, security incidents or operational problems.</p>
      </section>
      <section id="availability">
        <h2>4. Accuracy and availability</h2>
        <p>Market feeds, model responses and dashboards may be delayed, incomplete, incorrect or unavailable. Software updates, upstream outages and session resets may change or remove displayed history. Do not rely on this website as your sole source of market information or as a permanent record of transactions.</p>
        <p>Features and supported markets may change. Subject to applicable law, the service is provided as available without a promise of uninterrupted operation or fitness for a particular purpose.</p>
      </section>
      <section id="third-parties">
        <h2>5. External services and content</h2>
        <p>Links to TypeSafe AI, Hyperliquid, Kuru, Monad or other providers are for reference. Their services have their own terms and privacy practices. Naming a provider or linking to documentation does not establish endorsement, affiliation or a contractual relationship with that provider.</p>
        <p>Third-party trademarks, documentation and data remain subject to their owners’ rights. Any reuse of source code is governed by the license accompanying that code; these website terms do not replace it.</p>
      </section>
      <section id="responsibility">
        <h2>6. Your decisions and legal rights</h2>
        <p>You are responsible for independent decisions you make using information from this website, including any trading conducted elsewhere. Nothing in these terms excludes rights or liabilities that cannot lawfully be excluded, including mandatory consumer protections.</p>
      </section>
      <section id="privacy">
        <h2>7. Privacy</h2>
        <p>The <Link href="/privacy-policy">Privacy Policy</Link> describes browser preferences, website requests, infrastructure logs and external services relevant to the current implementation. Do not send private keys, seed phrases or API credentials through public channels.</p>
      </section>
      <section id="contact">
        <h2>8. Operator, contact and updates</h2>
        <p>Jev Trader is operated by an individual based in Singapore.</p>
        <p>For questions about these terms or the website, contact <a href="mailto:dev@jevm.ai">dev@jevm.ai</a>.</p>
        <p>The operator’s legal name and an effective date remain to be confirmed before publication. This draft does not impose a dispute-resolution venue. Material revisions should be published here with an accurate update date before they take effect.</p>
      </section>
    </article>
  );
}
