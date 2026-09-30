// Describe the project in initial HTML without adding a visible page section.
export default function ProjectSchema() {
  const origin = "https://jev-trader.com/";
  const repository = "https://github.com/web3w/jev-trader";
  const description = "An open-source dashboard for public Hyperliquid and Kuru market data, simulated trading and explanations of Jev model decisions.";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite", "@id": `${origin}#website`,
        name: "Jev Trader", alternateName: "jev-trader.com", url: origin,
        description, mainEntity: { "@id": `${origin}#application` },
      },
      {
        "@type": "WebApplication", "@id": `${origin}#application`,
        name: "Jev Trader", url: origin, description,
        applicationCategory: "FinanceApplication", operatingSystem: "Web",
        isAccessibleForFree: true,
      },
      {
        "@type": "SoftwareSourceCode", "@id": `${repository}#source`,
        name: "Jev Trader source code", url: repository, codeRepository: repository,
        targetProduct: { "@id": `${origin}#application` },
        isBasedOn: "https://github.com/jarrodwatts/jev-trader",
      },
    ],
  };


  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
}
