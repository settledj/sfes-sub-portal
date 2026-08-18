import { SCHOOL_LOGO_SRC, SCHOOL_LOGO_NAVY_SRC } from "@/lib/assets";

// Official St. Francis Episcopal School logo lockup (shield + wordmark), per
// the brand guide's horizontal lock-up spec — used as artwork, never
// re-created. `tone="navy"` swaps in the reversed-color variant for dark
// backgrounds (word "Francis" white, cross stays red, per the guide).
export function SchoolLogo({ height = 32, tone = "light" }: { height?: number; tone?: "light" | "navy" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tone === "navy" ? SCHOOL_LOGO_NAVY_SRC : SCHOOL_LOGO_SRC}
      alt="St. Francis Episcopal School"
      style={{ height, width: "auto" }}
    />
  );
}
