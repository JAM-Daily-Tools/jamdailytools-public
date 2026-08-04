# JAM Daily Tools — company website

Static marketing site for **JAM Daily Tools LLC** at
[jamdailytools.com](https://jamdailytools.com). Zero build step — plain
HTML/CSS/JS. Deployed as a **Cloudflare Worker with static assets**
(see `wrangler.jsonc`), not Cloudflare Pages.

## Files

| File | Purpose |
|---|---|
| `index.html` | Company landing page: hero, what we do, apps (Courtzee), about, contact. |
| `privacy.html` | Website privacy policy (covers this site only; each app has its own policy). |
| `terms.html` | Website terms of use (covers this site only; each app has its own terms/EULA). |
| `styles.css` | Shared styling — modern indigo/violet theme. |
| `wrangler.jsonc` | Cloudflare Worker config; serves the repo root. |

## Hosting (Cloudflare Worker with static assets)

The site is deployed as a Cloudflare **Worker** (static assets) and is reachable
at its `*.workers.dev` URL, e.g.
`https://jamdailytools-public.<account>.workers.dev/`.

### Point the custom domain at it

The `jamdailytools.com` zone is already in this Cloudflare account, but the
apex has no DNS record until you attach it to the Worker:

1. Cloudflare dashboard → **Workers & Pages** → open the **`jamdailytools-public`**
   worker.
2. **Settings → Domains & Routes** (a.k.a. *Triggers → Custom Domains*) →
   **Add → Custom Domain**.
3. Enter **`jamdailytools.com`** (and **`www.jamdailytools.com`** if you want
   both). Use **Custom Domain**, not *Route* — a Custom Domain auto-creates the
   proxied DNS record and TLS cert; a Route needs a record to already exist.

Within ~a minute `https://jamdailytools.com` resolves and serves the Worker,
and `http://` redirects to `https://`.

Cloudflare serves `/privacy` from `privacy.html` automatically via clean URLs,
so no redirects file is needed.

## Editing notes

- Brand colors live in the `:root` block of `styles.css` (`--brand`,
  `--brand-2`, etc.).
- The footer year updates automatically via a tiny inline script.
- The favicon is an inline SVG data-URI in each page's `<head>` — no image
  asset to manage.
- Contact emails (`admin@` / `support@jamdailytools.com`) are forwarding rules
  configured in Cloudflare Email Routing.

## Adding a new app

Duplicate the Courtzee `<article class="product">` block in `index.html`, give
it its own mark color, and link to its site. Keep each app's detailed privacy
policy on that app's own domain.
