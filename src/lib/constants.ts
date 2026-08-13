// Brand tokens (St. Francis Episcopal School brand guide) — ported from the prototype.
export const C = {
  navy: "#1B2A53",
  navyLight: "#2C3F70",
  red: "#F32735",
  gold: "#B8923A",
  teal: "#2E7D6E",
  blue: "#4A6FA5",
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
