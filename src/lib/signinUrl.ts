// Builds a /signin URL with query params, preserving `from`. Kept as a
// standalone top-level function (not a closure inside the page component) —
// server actions defined inside a Server Component can't capture local
// function values from the surrounding scope.
export function signinUrl(from: string | undefined, extra: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  for (const [k, v] of Object.entries(extra)) if (v) params.set(k, v);
  const s = params.toString();
  return s ? `/stfrancishouston/signin?${s}` : "/stfrancishouston/signin";
}
