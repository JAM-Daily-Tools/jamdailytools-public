# JAM Daily Tools — company website

Static marketing site for **JAM Daily Tools LLC** at
[jamdailytools.com](https://jamdailytools.com). Zero build step — plain
HTML/CSS/JS. Hosted on **Cloudflare Pages**.

## Files

| File | Purpose |
|---|---|
| `index.html` | Company landing page: hero, what we do, apps (Courtzee), about, contact. |
| `privacy.html` | Website privacy policy (covers this site only; each app has its own policy). |
| `styles.css` | Shared styling — modern indigo/violet theme. |

## Deploy to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   connect this repo (or direct-upload the folder).
2. Build settings: **no build command**; **output directory** = `/` (the repo
   root — these files are served as-is).
3. Add the custom domain **jamdailytools.com** (Pages → Custom domains). DNS is
   already on Cloudflare.

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
