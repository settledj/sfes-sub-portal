// Brand tokens (St. Francis Episcopal School brand guide) — ported from the prototype.
// Navy and red are Pantone 281 / 1788 (St. Francis primary palette) — exact
// match to the official brand guide. Gold/teal/blue are the guide's official
// secondary palette (division colors). Grey/greyLight/cream are app-only
// neutrals, not specified by the brand guide.
export const C = {
  navy: "#1B2A53",
  navyLight: "#2C3F70",
  red: "#F32735",
  gold: "#EDA04E",
  teal: "#00B8B3",
  blue: "#5078B7",
  grey: "#6B7280",
  greyLight: "#EEF0F3",
  cream: "#FAF9F7",
};

export const SUBJECTS = ["Math", "English", "Science", "History", "Spanish", "PE", "Art", "Music"];

export const DIVISIONS = ["PS", "LS", "MS", "US", "PE"];

export const DEMO_PASSWORD = "1234";

// Shared label/color map for request status badges (used across list views).
export const BOOKING_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: C.gold, bg: "#FBF2DF" },
  accepted: { label: "Confirmed", color: C.teal, bg: "#E4F2EF" },
  declined: { label: "Declined", color: C.grey, bg: "#EEF0F3" },
  cancelled: { label: "Cancelled", color: C.grey, bg: "#EEF0F3" },
};

// A pending cancellation request is orthogonal to `status` (the booking is
// still pending/accepted underneath), but it's the more relevant thing to
// show in a status badge slot — reuses the same gold as "Pending" since both
// mean "needs someone's attention."
export function bookingBadgeMeta(r: { status: string; cancelRequestedAt?: number | null }) {
  if (r.cancelRequestedAt && r.status !== "cancelled" && r.status !== "declined") {
    return { label: "Cancellation requested", color: C.gold, bg: "#FBF2DF" };
  }
  return BOOKING_STATUS_META[r.status] || BOOKING_STATUS_META.pending;
}
