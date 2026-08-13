export function initialsOf(name: string): string {
  const parts = name.replace(/"[^"]*"/g, "").split(" ").filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase();
}

// Prototype login convention: first-initial + last name, lowercase, no space.
// e.g. "Wlede Frankfort" -> "wfrankfort", "David Settle" -> "dsettle",
// "Fabián Saldaña" -> "fsaldana" (accents are stripped to their base letter).
export function usernameFor(name: string): string {
  const stripped = name
    .replace(/"[^"]*"/g, " ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // strip diacritics (á->a, ñ->n, etc.)
  const parts = stripped.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0];
  const last = parts[parts.length - 1];
  return (first[0] + last).toLowerCase().replace(/[^a-z]/g, "");
}
