# Adding FAQ articles

The footer and FAQ directory use `web/src/app/faq/articles.ts`. The same catalog supplies article URLs to the sitemap.

1. Create the complete, source-backed article at a stable `/faq/<topic>` URL. Add real translations under `/zh/faq/<topic>` and `/ko/faq/<topic>` when available. Keep the article readable in initial HTML, with one H1 and correct language metadata.
2. Prepend one entry to `faqArticles` with a unique ID and the existing page paths, titles and summaries for each language. The array is deliberately ordered newest first; do not reorder older articles merely for minor edits. Do not register drafts or use section anchors as separate articles.
3. The footer automatically displays the first three entries. When a fourth entry exists, More links to the matching language directory. The FAQ heading always links to that directory, even with fewer articles. Directory pages show the full catalog.
4. Keep each article's canonical and hreflang metadata consistent with its actual language URLs. The Jev model guide uses `/faq/jev-ai-decision-model`; `/jev` and `/jev-ai-decision-model` permanently redirect there. Its existing language switcher is retained; do not register translation URLs that do not exist.
5. Run `bun test web/scripts/faq-navigation.test.tsx`, then in `web` run `bun run build`. Start the preview and run `FAQ_BASE_URL=http://127.0.0.1:3187 bun run check:seo`. Review source accuracy, examples, language, mobile layout and all new article links before requesting publication.

A target of two high-quality articles per day is an editorial plan, not an automated publishing schedule. Publish only complete articles with verifiable claims; no publication dates or sitemap lastmod values are fabricated.

## Restored Polymarket article — 2026-09-21

The catalog contains four distinct articles. The Polymarket draft is restored at `/faq/jev-polymarket`, `/zh/faq/jev-polymarket`, and `/ko/faq/jev-polymarket`, separately from the existing tool. The user subsequently requested removal of the JEV/LLM comparison article; its local page, draft and catalog entry have been deleted. Its URL must return 404 and must not appear in the sitemap.

The Chinese and English directories contain four articles; Korean contains three. Footer previews remain limited to three with a More link. Published and verified on 2026-09-21; see `docs/research/about-article-release-2026-09-21.md`.
