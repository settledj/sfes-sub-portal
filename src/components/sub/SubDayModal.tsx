"use client";

import { X } from "lucide-react";
import { C } from "@/lib/constants";
import { dateKey, shortDateLabel } from "@/lib/dates";
import { effectiveStatus } from "@/lib/availability";
import type { Sub } from "@/lib/types";

// Only reached for days that aren't already an actual booking — the caller
// routes booked days to the shared BookingDetailModal instead. This modal is
// just the set-your-availability affordance for everything else.
export function SubDayModal({
  sub,
  date,
  onClose,
  onSetStatus,
}: {
  sub: Sub;
  date: Date;
  onClose: () => void;
  onSetStatus: (dk: string, status: "available" | "unavailable") => void;
}) {
  const dk = dateKey(date);
  const status = effectiveStatus(sub.availability[dk]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
          <X size={18} color={C.grey} />
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
          {date.toLocaleDateString(undefined, { weekday: "long" })}
        </p>
        <p className="text-lg font-bold mb-4" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
          {shortDateLabel(date)}
        </p>

        <p className="text-sm mb-3" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          Set your availability for this date.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onSetStatus(dk, "available")}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: status === "available" ? C.teal : C.greyLight,
              color: status === "available" ? "white" : C.navy,
              fontFamily: "Barlow, sans-serif",
            }}
          >
            Available
          </button>
          <button
            onClick={() => onSetStatus(dk, "unavailable")}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: status === "unavailable" ? C.red : C.greyLight,
              color: status === "unavailable" ? "white" : C.navy,
              fontFamily: "Barlow, sans-serif",
            }}
          >
            Unavailable
          </button>
        </div>
      </div>
    </div>
  );
}
