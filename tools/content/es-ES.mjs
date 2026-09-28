import neutralSpanish from "./es.mjs";

function adapt(value) {
  if (Array.isArray(value)) return value.map(adapt);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, adapt(item)]));
  if (typeof value !== "string") return value;
  return value
    .replaceAll("https://tourneysmith.com/es/", "https://tourneysmith.com/es-ES/")
    .replaceAll("canchas", "pistas")
    .replaceAll("cancha", "pista")
    .replaceAll("posiciones", "clasificación");
}

const content = adapt(neutralSpanish);
content.lang = "es-ES";
content.prefix = "es-ES/";

export default content;
