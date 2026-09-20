# Branded-search diagnostic report: checking official Google guidance

Checked on 2026-09-20. Scope: verify the report's descriptions of search mechanisms and proposed fixes. Domain, HTTP and ranking figures supplied by the report are not treated as independently retested, and this does not replace diagnosis inside Search Console.

## Conclusion

The available evidence does not establish that the site “was not penalized but dropped out of the index after a new-domain quality reassessment.” Absence from branded queries, an unindexed URL and a URL selected as a duplicate are different states. Obtain Search Console URL Inspection and actual indexing records first. Google distinguishes crawling, indexing and serving, and guarantees none of them. [How Google Search works](https://developers.google.com/search/docs/fundamentals/how-search-works)

## Claim-by-claim review

| Report claim | Finding and appropriate wording |
| --- | --- |
| Every new domain goes through “initial indexing → quality reassessment → removal from the index” | This review found no official Google definition of such a mandatory cycle. Google recognizes that a site being too new is a common reason for not being indexed, and says crawl/index timing cannot be predicted or guaranteed. That does not establish the cause of this disappearance. [Crawling and indexing FAQ](https://developers.google.com/search/help/crawling-index-faq) |
| A mandatory 3–14 day phase is followed by stable indexing in 4–12 weeks | No official support was found for these fixed windows. Google says recrawling can take days to weeks and does not guarantee indexing. This is not a promise of stable indexing. [Request recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) |
| About 380 words proves thin content; expand to 800–1500 words | Word count does not prove quality. Google explicitly has no preferred word count. Add accurate explanations, sources and independent information needed for the reader's task, without a padding target. Financial content particularly needs trustworthiness, but E-E-A-T itself is not a specific ranking factor. [People-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) |
| The HYPE page canonical pointing to the home page must be wrong | Not established. If both URLs provide the same market content, consolidating at the home page can be reasonable. A canonical is a strong signal, not noindex, and Google can choose another canonical. Only make the HYPE page self-canonical if it is intended to become a distinct landing page, with differentiated content and corresponding internal-link and sitemap updates. [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) |
| robots allows crawling, there is no noindex and no security flag, so there is no penalty | Not established. These cover only some access and indexing conditions. Google uses automated spam detection and manual actions. Public HTTP or Safe Browsing checks cannot rule out search-policy effects or prove the account has no manual actions. [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) |
| Initial HTML contains placeholders, so Google can ultimately see only an empty shell | Limit this statement to what the ordinary HTTP fetch observed. Google executes JavaScript and uses rendered HTML for indexing. SSR or prerendering still benefits readers and crawlers that cannot execute JavaScript. Check URL Inspection rendering to establish whether rendering failed. [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) |
| Refreshing lastmod on every content update improves recrawling | Record only the last actual meaningful update, keeping it accurate and verifiable. Do not use the current timestamp on every build or request. Substantive changes to content, structured data and links can qualify; copyright-year updates do not. Do not fabricate dates if accurate maintenance is unavailable. [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) |
| Identical responses across user agents establish no search-policy risk | Consistent content helps investigate user-agent-based cloaking but cannot rule out other problems. Google's current policy covers manipulation of search rankings and generative AI answers in Google Search. Machine-targeted, visually hidden text requesting maximum weight or preferential citation presents a clear hidden-text policy risk. This is a policy-risk assessment, not proof that it caused this ranking change. [Hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse) |

## Interpretation limits for this project

The primary agent's code review found that the home page directly reuses the HYPE page and metadata, with an explicit comment explaining that the shared market uses the root URL for search and sharing. Do not change that canonical to self-reference without first deciding whether the home and HYPE pages should continue sharing content or serve distinct purposes.

The primary agent's production HTTP check found no H1 on the home, HYPE or Kuru pages. Home and HYPE titles matched; home and Kuru were self-canonical, while HYPE pointed to home. The model guide had one H1. The production sitemap contained four URLs, including HYPE despite its canonical pointing to home, creating inconsistent canonicalization signals that should be resolved alongside page positioning. The local sitemap already included the FAQ in three languages, so local and production versions must not be treated as the same state.

The primary agent sampled local code and found hidden AI guidance in the shared layout, but sampled production HYPE and model-guide pages did not contain those elements. This is not evidence of the cause of the production search change. Still, address the policy risk before deploying; do not treat the text as an SEO benefit.

These project facts come from code and HTTP checks performed in the same task. This document interprets official guidance without repeating the site checks.

This review did not independently verify domain registration date, Safe Browsing, textual similarity, actual Google rankings or differences between User-Agent responses, and had no Search Console account data. It therefore does not confirm those report figures or the claim of “no manual actions.”

## Direct evidence needed next

1. Save Search Console indexing status, last crawl time, user-declared canonical, Google-selected canonical and exclusion reasons for the home and market pages.
2. Check Manual Actions, Security Issues and temporary removal records. Public scans cannot replace these account-level results.
3. Inspect the live test's rendered HTML, screenshots and resource issues. Passing a live test neither establishes indexing nor guarantees serving.
4. Compare impressions and rankings in the Performance report by branded query, page, date, country and device to distinguish indexing changes from query-ranking changes.

URL Inspection's indexed results and live tests have different meanings. Google also directs users to check manual actions, security issues and temporary removals when pages are missing. After fixing a few important pages, indexing can be requested, but requests do not guarantee inclusion. [URL Inspection tool](https://support.google.com/webmasters/answer/9012289?hl=en)

Appropriate current wording: “We identified opportunities to improve content presentation and page positioning; the direct cause of branded-query invisibility still requires Search Console evidence.”
