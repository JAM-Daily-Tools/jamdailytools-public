# JAM Daily Tools company website

Static company, product-summary, website-privacy, and website-terms pages for
[jamdailytools.com](https://jamdailytools.com). Cloudflare Workers Static
Assets serves the repository root with no production build step.

## Locales and routes

| Locale | Route prefix | Pages |
|---|---|---|
| `en` | `/` | company, privacy, terms |
| `es` | `/es/` | company, privacy, terms |
| `es-ES` | `/es-ES/` | company, privacy, terms |
| `pt-BR` | `/pt/` | company, privacy, terms |
| `fr` | `/fr/` | company, privacy, terms |
| `it` | `/it/` | company, privacy, terms |

Every page provides a visible selector, localized metadata, canonical URL, and
reciprocal `hreflang`. Only company marketing may use the saved or browser
language automatically. Privacy and Terms never redirect automatically.

## Legal boundary

The policies in this repository cover `jamdailytools.com` only. They describe
Cloudflare request processing, the limited browser language preference, and
messages sent to company email addresses. They do not describe TourneySmith app
accounts or product data. Each locale links to the corresponding TourneySmith
Privacy Policy and Terms on `tourneysmith.com`.

Do not add `app-ads.txt` here. The Microsoft publisher-verification file at
`.well-known/microsoft-identity-association.json` must remain byte-for-byte
unchanged and directly reachable.

## Source and generated files

The 18 deployed HTML pages and `sitemap.xml` are committed. Edit localized
content under `tools/content/`, then regenerate:

```bash
node tools/generate-site.mjs
```

`tools` and `test` are excluded from deployment by `.assetsignore`.

## Owner-run tests

The repository rules prohibit the assistant from running tests. The owner runs:

```bash
node --test test/site-contract.test.mjs
```

Expected result: 12 passing tests.

## Review and deployment

The French and Italian copy awaits native review. All legal translations need
qualified legal review before deployment. The detailed shared review list and
launch-region decision record are maintained in the TourneySmith public
repository under `docs/`.

`wrangler.jsonc` serves the repository root. Review generated HTML and owner-run
test results before pushing to a deployment-connected branch.
