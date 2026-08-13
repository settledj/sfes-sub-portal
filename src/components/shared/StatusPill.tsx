import { C } from "@/lib/constants";
import { effectiveStatus, type RawAvailability } from "@/lib/availability";

export function StatusPill({ status }: { status: RawAvailability }) {
  const map = {
    available: { label: "Available", color: C.teal },
    unavailable: { label: "Unavailable", color: C.red },
    booked: { label: "Booked", color: C.gold },
  };
  const s = map[effectiveStatus(status)];
  return (
    <span className="text-xs font-semibold" style={{ color: s.color, fontFamily: "Barlow, sans-serif" }}>
      {s.label}
    </span>
  );
}
