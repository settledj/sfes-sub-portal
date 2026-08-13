export type EffectiveStatus = "available" | "unavailable" | "booked";
// Accepts a stored exception ("unavailable"/"booked"), an already-computed
// EffectiveStatus (effectiveStatus is idempotent), or nothing at all.
export type RawAvailability = EffectiveStatus | undefined | null;

// A sub's raw availability record only ever stores an exception: 'unavailable'
// (they blocked it themselves) or 'booked' (a request was accepted for it).
// Anything else — including no entry at all — defaults to available.
export function effectiveStatus(raw: RawAvailability): EffectiveStatus {
  if (raw === "unavailable" || raw === "booked") return raw;
  return "available";
}

export function isRequestable(raw: RawAvailability): boolean {
  return effectiveStatus(raw) === "available";
}
