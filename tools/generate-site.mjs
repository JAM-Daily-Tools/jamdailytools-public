import {mkdir, writeFile} from "node:fs/promises";
import {locales, localeOrder} from "./localized-content.mjs";

const root = new URL("../", import.meta.url);
const files = {landing: "index.html", privacy: "privacy.html", terms: "terms.html"};

function routeFor(localeKey, page) {
  const leaf = page === "landing" ? "" : page;
  return `https://jamdailytools.com/${locales[localeKey].prefix}${leaf}`;
}

function localHref(locale, page, hash = "") {
  return `/${locale.prefix}${page === "landing" ? "" : page}${hash}`;
}

function productHref(locale, page = "") {
  return `https://tourneysmith.com/${locale.prefix}${page}`;
}

function head(localeKey, page, title, description) {
  const canonical = routeFor(localeKey, page);
  const alternateLinks = localeOrder.map((key) => `  <link rel="alternate" hreflang="${key}" href="${routeFor(key, page)}">`).join("\n");
  return `<!DOCTYPE html>
<html lang="${locales[localeKey].lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
${alternateLinks}
  <link rel="alternate" hreflang="x-default" href="${routeFor("en", page)}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta name="theme-color" content="#4f46e5">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%234f46e5'/%3E%3Ctext x='32' y='42' font-family='Arial' font-size='26' font-weight='700' fill='white' text-anchor='middle'%3EJAM%3C/text%3E%3C/svg%3E">
  <link rel="stylesheet" href="/styles.css">
  <script src="/site.js" defer></script>
</head>`;
}

function languageSelector(locale) {
  const options = [["en", "English"], ["es", "Español (Latinoamérica)"], ["es-ES", "Español (España)"], ["pt-BR", "Português (Brasil)"], ["fr", "Français"], ["it", "Italiano"]]
    .map(([value, label]) => `<option value="${value}"${value === locale.lang ? " selected" : ""}>${label}</option>`).join("");
  return `<label class="language-picker"><span>${locale.labels.language}</span><select data-language-select aria-label="${locale.labels.language}">${options}</select></label>`;
}

function header(localeKey) {
  const locale = locales[localeKey];
  return `<header class="site-header">
  <a class="brand" data-local-link href="${localHref(locale, "landing")}"><span class="logo" aria-hidden="true">JAM</span><span class="brand-name">JAM Daily Tools</span></a>
  <nav class="nav" aria-label="${locale.labels.primaryNavigation}">
    <a data-local-link href="${localHref(locale, "landing", "#products")}">${locale.labels.products}</a>
    <a data-local-link href="${localHref(locale, "landing", "#about")}">${locale.labels.about}</a>
    <a data-local-link href="${localHref(locale, "privacy")}">${locale.labels.privacy}</a>
    <a data-local-link href="${localHref(locale, "terms")}">${locale.labels.terms}</a>
    ${languageSelector(locale)}
  </nav>
</header>`;
}

function footer(localeKey) {
  const locale = locales[localeKey];
  return `<footer class="site-footer"><div class="wrap footer-inner">
  <div class="footer-brand"><span class="logo logo-sm" aria-hidden="true">JAM</span><span>JAM Daily Tools</span></div>
  <nav class="footer-links" aria-label="${locale.labels.footerNavigation}">
    <a data-local-link href="${localHref(locale, "landing")}">${locale.labels.home}</a>
    <a data-product-link href="${productHref(locale)}">TourneySmith</a>
    <a data-local-link href="${localHref(locale, "privacy")}">${locale.labels.privacy}</a>
    <a data-local-link href="${localHref(locale, "terms")}">${locale.labels.terms}</a>
    <a href="mailto:admin@jamdailytools.com">${locale.labels.contact}</a>
  </nav>
  <div class="footer-copy">© <span data-current-year></span> JAM Daily Tools LLC. ${locale.labels.rights}</div>
</div></footer>`;
}

function landingPage(localeKey) {
  const locale = locales[localeKey];
  const values = locale.landing.values.map((item) => `<article class="card"><h3>${item.title}</h3><p>${item.body}</p></article>`).join("\n");
  return `${head(localeKey, "landing", locale.meta.title, locale.meta.description)}
<body data-locale="${locale.lang}" data-page="marketing">
${header(localeKey)}
<main>
  <section class="hero wrap" aria-labelledby="hero-title"><p class="eyebrow">JAM Daily Tools LLC</p><h1 id="hero-title">${locale.landing.heading}</h1><p class="lede">${locale.landing.lede}</p><div class="cta-row"><a class="btn btn-primary" data-local-link href="${localHref(locale, "landing", "#products")}">${locale.landing.viewApps}</a><a class="btn btn-ghost" data-local-link href="${localHref(locale, "landing", "#contact")}">${locale.landing.getInTouch}</a></div></section>
  <section class="wrap section" aria-labelledby="work-title"><h2 id="work-title" class="section-title">${locale.landing.workTitle}</h2><p class="section-sub">${locale.landing.workIntro}</p><div class="cards">${values}</div></section>
  <section id="products" class="wrap section" aria-labelledby="products-title"><h2 id="products-title" class="section-title">${locale.landing.appsTitle}</h2><p class="section-sub">${locale.landing.appsIntro}</p>
    <article class="product"><div class="product-mark tourneysmith"><img src="/tourneysmith-icon.png" alt="" width="72" height="72"></div><div class="product-body"><div class="product-head"><h3>TourneySmith</h3><span class="pill pill-soon">${locale.landing.comingSoon}</span></div><p class="product-tag">${locale.landing.productTagline}</p><p>${locale.landing.productBody}</p><div class="product-meta"><span class="chip chip-muted">Android · ${locale.landing.comingSoon}</span><span class="chip chip-muted">iOS · ${locale.landing.comingSoon}</span></div><div class="product-links"><a class="btn btn-primary btn-sm" data-product-link href="${productHref(locale)}">${locale.landing.visitProduct}</a><a class="btn btn-ghost btn-sm" data-product-link href="${productHref(locale, "privacy")}">${locale.labels.privacy}</a><a class="btn btn-ghost btn-sm" data-product-link href="${productHref(locale, "terms")}">${locale.labels.terms}</a></div></div></article>
  </section>
  <section id="about" class="wrap section about" aria-labelledby="about-title"><h2 id="about-title" class="section-title">${locale.labels.about}</h2><p>${locale.landing.aboutBody}</p></section>
  <section id="contact" class="wrap section contact" aria-labelledby="contact-title"><h2 id="contact-title" class="section-title">${locale.labels.contact}</h2><p class="section-sub">${locale.landing.contactIntro}</p><div class="contact-grid"><a class="contact-card" href="mailto:admin@jamdailytools.com"><span class="contact-label">${locale.landing.general}</span><span class="contact-email">admin@jamdailytools.com</span></a><a class="contact-card" href="mailto:support@jamdailytools.com"><span class="contact-label">${locale.landing.appSupport}</span><span class="contact-email">support@jamdailytools.com</span></a></div></section>
</main>
${footer(localeKey)}
<script type="application/ld+json">${JSON.stringify({"@context": "https://schema.org", "@type": "Organization", name: "JAM Daily Tools LLC", url: "https://jamdailytools.com", email: "admin@jamdailytools.com", description: locale.meta.description, address: {"@type": "PostalAddress", streetAddress: "18203 Rim Drive 101 #1120", addressLocality: "San Antonio", addressRegion: "TX", postalCode: "78257", addressCountry: "US"}, brand: {"@type": "Brand", name: "TourneySmith"}})}</script>
</body></html>
`;
}

function legalPage(localeKey, page) {
  const locale = locales[localeKey];
  const content = locale[page];
  const sections = content.sections.map((section) => `<section data-section="${section.id}"><h2>${section.title}</h2>${section.body}</section>`).join("\n");
  return `${head(localeKey, page, content.metaTitle, content.metaDescription)}
<body data-locale="${locale.lang}" data-page="${page}">
${header(localeKey)}
<main class="wrap"><article class="legal" data-document-version="2026-09-27"><h1>${content.title}</h1><p class="updated">${content.updated}</p>${sections}</article></main>
${footer(localeKey)}
</body></html>
`;
}

for (const localeKey of localeOrder) {
  const locale = locales[localeKey];
  if (locale.prefix) await mkdir(new URL(locale.prefix, root), {recursive: true});
  await writeFile(new URL(`${locale.prefix}${files.landing}`, root), landingPage(localeKey));
  await writeFile(new URL(`${locale.prefix}${files.privacy}`, root), legalPage(localeKey, "privacy"));
  await writeFile(new URL(`${locale.prefix}${files.terms}`, root), legalPage(localeKey, "terms"));
}

const urls = localeOrder.flatMap((localeKey) => Object.keys(files).map((page) => `  <url><loc>${routeFor(localeKey, page)}</loc></url>`));
await writeFile(new URL("sitemap.xml", root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
