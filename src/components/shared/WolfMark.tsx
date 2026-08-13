import { C } from "@/lib/constants";
import { WOLF_LOGO_SRC } from "@/lib/assets";

// Official wolf mark, rendered on white per the brand guide's "full color wolf on white" treatment.
export function WolfMark({ size = 34, rounded = "rounded-md" }: { size?: number; rounded?: string }) {
  return (
    <div
      className={`flex items-center justify-center shrink-0 bg-white ${rounded}`}
      style={{ width: size, height: size, border: `1.5px solid ${C.navy}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={WOLF_LOGO_SRC}
        alt="St. Francis Episcopal School wolf mark"
        style={{ width: "82%", height: "82%", objectFit: "contain" }}
      />
    </div>
  );
}
