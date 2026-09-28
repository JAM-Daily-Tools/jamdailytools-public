import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {access, readFile} from "node:fs/promises";
import {runInNewContext} from "node:vm";
import test from "node:test";

const root = new URL("../", import.meta.url);
const locales = {
  en: {prefix: "", lang: "en", title: "JAM Daily Tools | Practical apps for everyday work"},
  es: {prefix: "es/", lang: "es", title: "JAM Daily Tools | Aplicaciones prácticas para el trabajo diario"},
  "es-ES": {prefix: "es-ES/", lang: "es-ES", title: "JAM Daily Tools | Aplicaciones prácticas para el trabajo diario"},
  "pt-BR": {prefix: "pt/", lang: "pt-BR", title: "JAM Daily Tools | Aplicativos práticos para o dia a dia"},
  fr: {prefix: "fr/", lang: "fr", title: "JAM Daily Tools | Des applications pratiques au quotidien"},
  it: {prefix: "it/", lang: "it", title: "JAM Daily Tools | Applicazioni pratiche per il lavoro quotidiano"},
};
const pages = ["index.html", "privacy.html", "terms.html"];
const fileFor = (locale, page) => new URL(`${locales[locale].prefix}${page}`, root);
const routeFor = (locale, page) => `https://jamdailytools.com/${locales[locale].prefix}${page === "index.html" ? "" : page.replace(/\.html$/, "")}`;
const read = (path) => readFile(new URL(path, root), "utf8");

test("every locale has the complete company page set", async () => {
  for (const locale of Object.keys(locales)) for (const page of pages) await access(fileFor(locale, page));
});

test("documents declare the exact locale language", async () => {
  for (const [locale, config] of Object.entries(locales)) {
    for (const page of pages) assert.ok((await readFile(fileFor(locale, page), "utf8")).includes(`<html lang="${config.lang}">`));
  }
});

test("canonical and reciprocal hreflang links cover every locale", async () => {
  for (const locale of Object.keys(locales)) {
    for (const page of pages) {
      const html = await readFile(fileFor(locale, page), "utf8");
      assert.ok(html.includes(`<link rel="canonical" href="${routeFor(locale, page)}">`));
      for (const alternate of Object.keys(locales)) assert.ok(html.includes(`hreflang="${alternate}" href="${routeFor(alternate, page)}"`));
      assert.ok(html.includes(`hreflang="x-default" href="${routeFor("en", page)}"`));
    }
  }
});

test("landing metadata is translated", async () => {
  for (const [locale, config] of Object.entries(locales)) {
    const html = await readFile(fileFor(locale, "index.html"), "utf8");
    assert.ok(html.includes(`<title>${config.title}</title>`), locale);
    assert.match(html, /<meta name="description" content="[^\"]{70,}">/);
    assert.ok(html.includes(`<meta property="og:title" content="${config.title}">`));
  }
});

test("company and TourneySmith links match the selected locale", async () => {
  for (const [locale, config] of Object.entries(locales)) {
    const localPrefix = `/${config.prefix}`;
    for (const page of pages) {
      const html = await readFile(fileFor(locale, page), "utf8");
      for (const match of html.matchAll(/data-local-link href="([^\"]+)"/g)) assert.ok(match[1].startsWith(localPrefix));
      for (const match of html.matchAll(/data-product-link href="([^\"]+)"/g)) assert.ok(match[1].startsWith(`https://tourneysmith.com/${config.prefix}`));
    }
  }
});

test("translated pages do not leak common English interface copy", async () => {
  const forbidden = ["Home", "Products", "About", "Contact", "Privacy Policy", "Terms of Use", "All rights reserved", "Last updated"];
  for (const locale of Object.keys(locales).filter((value) => value !== "en")) {
    for (const page of pages) {
      const html = await readFile(fileFor(locale, page), "utf8");
      for (const phrase of forbidden) assert.ok(!html.includes(`>${phrase}<`), `${locale}/${page}: ${phrase}`);
    }
  }
});

test("public copy contains no em dashes or prohibited filler", async () => {
  for (const locale of Object.keys(locales)) {
    for (const page of pages) {
      const html = (await readFile(fileFor(locale, page), "utf8")).toLowerCase();
      for (const phrase of ["\u2014", "seamlessly", "game-changing", "revolutionary", "elevate your"]) assert.ok(!html.includes(phrase));
    }
  }
});

test("legal translations share versions and section contracts", async () => {
  const contracts = {
    "privacy.html": ["scope", "controller", "website-data", "language-preference", "email", "cloudflare", "sharing", "retention", "rights", "children", "international", "changes", "contact"],
    "terms.html": ["scope", "app-boundary", "site-use", "intellectual-property", "third-party-links", "warranty", "liability", "mandatory-rights", "governing-law", "changes", "contact"],
  };
  for (const [page, sections] of Object.entries(contracts)) {
    for (const locale of Object.keys(locales)) {
      const html = await readFile(fileFor(locale, page), "utf8");
      assert.ok(html.includes("data-document-version=\"2026-09-27\""));
      assert.deepEqual([...html.matchAll(/data-section="([^\"]+)"/g)].map((match) => match[1]), sections);
    }
  }
});

test("company legal pages stay website-only and link to product policies", async () => {
  for (const locale of Object.keys(locales)) {
    const combined = `${await readFile(fileFor(locale, "privacy.html"), "utf8")}${await readFile(fileFor(locale, "terms.html"), "utf8")}`;
    for (const productTerm of ["Firebase Authentication", "Cloud Firestore", "AdMob", "Crashlytics"]) assert.ok(!combined.includes(productTerm));
    assert.ok(combined.includes(`data-product-link href="https://tourneysmith.com/${locales[locale].prefix}privacy"`));
    assert.ok(combined.includes(`data-product-link href="https://tourneysmith.com/${locales[locale].prefix}terms"`));
  }
});

test("only company marketing may auto-select a language", async () => {
  const script = await read("site.js");
  const sandbox = {window: {}};
  runInNewContext(script, sandbox);
  assert.equal(sandbox.window.JamSite.shouldAutoLocalize("marketing"), true);
  assert.equal(sandbox.window.JamSite.shouldAutoLocalize("privacy"), false);
  assert.equal(sandbox.window.JamSite.shouldAutoLocalize("terms"), false);
  for (const locale of Object.keys(locales)) {
    for (const page of ["privacy.html", "terms.html"]) {
      assert.ok(!(await readFile(fileFor(locale, page), "utf8")).includes("data-page=\"marketing\""));
    }
  }
});

test("verification asset remains unchanged and no app-ads file is introduced", async () => {
  const association = await readFile(new URL(".well-known/microsoft-identity-association.json", root));
  assert.equal(createHash("sha256").update(association).digest("hex"), "1a3d29c264da98149067ca3aabd5f317fc8b15bc658e90becdf99c0f42203696");
  await assert.rejects(access(new URL("app-ads.txt", root)));
  for (const config of Object.values(locales).filter((value) => value.prefix)) {
    await assert.rejects(access(new URL(`${config.prefix}.well-known/microsoft-identity-association.json`, root)));
  }
});

test("local links, sitemap, and maintenance documentation match deployed pages", async () => {
  for (const locale of Object.keys(locales)) {
    for (const page of pages) {
      const html = await readFile(fileFor(locale, page), "utf8");
      for (const match of html.matchAll(/href="(\/[^\"?#]+)"/g)) {
        const link = match[1];
        if (["/styles.css", "/site.js", "/tourneysmith-icon.png"].includes(link)) continue;
        const relative = link === "/" ? "index.html" : `${link.replace(/^\//, "").replace(/\/$/, "")}.html`;
        const directoryIndex = `${link.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
        await assert.doesNotReject(async () => {
          try { await access(new URL(relative, root)); } catch { await access(new URL(directoryIndex, root)); }
        });
      }
    }
  }
  const sitemap = await read("sitemap.xml");
  for (const locale of Object.keys(locales)) for (const page of pages) assert.ok(sitemap.includes(routeFor(locale, page)));
  const readme = await read("README.md");
  for (const value of ["en", "es", "es-ES", "pt-BR", "fr", "it", "/pt/"]) assert.ok(readme.includes(value));
  const assetsIgnore = await read(".assetsignore");
  for (const path of ["test", "tools"]) assert.match(assetsIgnore, new RegExp(`^${path}$`, "m"));
});
