(function (global) {
  "use strict";

  var localePrefixes = {en: "", es: "es", "es-ES": "es-ES", "pt-BR": "pt", fr: "fr", it: "it"};

  function shouldAutoLocalize(pageType) {
    return pageType === "marketing";
  }

  function localeFromLanguages(languages) {
    var values = Array.isArray(languages) ? languages : [];
    for (var index = 0; index < values.length; index += 1) {
      var language = String(values[index]).toLowerCase();
      if (language === "es-es" || language.startsWith("es-es-")) return "es-ES";
      if (language === "pt" || language.startsWith("pt-")) return "pt-BR";
      if (language === "es" || language.startsWith("es-")) return "es";
      if (language === "fr" || language.startsWith("fr-")) return "fr";
      if (language === "it" || language.startsWith("it-")) return "it";
      if (language === "en" || language.startsWith("en-")) return "en";
    }
    return "en";
  }

  function localizedPageUrl(input, locale) {
    var parsed = new URL(input, "https://jamdailytools.com");
    var path = parsed.pathname.replace(/^\/(?:es-ES|es|pt|fr|it)(?=\/|$)/, "") || "/";
    var prefix = localePrefixes[locale] || "";
    return (prefix ? "/" + prefix + (path === "/" ? "/" : path) : path) + parsed.search + parsed.hash;
  }

  global.JamSite = {
    localeFromLanguages: localeFromLanguages,
    localizedPageUrl: localizedPageUrl,
    shouldAutoLocalize: shouldAutoLocalize,
  };

  if (!global.document) return;

  var document = global.document;
  var body = document.body;
  var currentLocale = body.dataset.locale || "en";
  var pageType = body.dataset.page || "legal";

  document.querySelectorAll("[data-current-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("[data-language-select]").forEach(function (select) {
    select.value = currentLocale;
    select.addEventListener("change", function () {
      var locale = select.value;
      try { global.localStorage.setItem("jam-language", locale); } catch (_) {}
      global.location.assign(localizedPageUrl(global.location.href, locale));
    });
  });

  if (shouldAutoLocalize(pageType) && currentLocale === "en") {
    var selected;
    try { selected = global.localStorage.getItem("jam-language"); } catch (_) {}
    var preferred = localePrefixes[selected] !== undefined
      ? selected
      : localeFromLanguages(global.navigator.languages || [global.navigator.language]);
    if (preferred !== "en") global.location.replace(localizedPageUrl(global.location.href, preferred));
  }
})(typeof window === "undefined" ? this : window);
