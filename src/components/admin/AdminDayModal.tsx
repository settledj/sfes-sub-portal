"use client";

import { X } from "lucide-react";
import { C } from "@/lib/constants";
import { dateKey, prettyDate } from "@/lib/dates";
import { effectiveStatus } from "@/lib/availability";
import { AvatarPair } from "@/components/shared/Avatar";
import type { Sub, Teacher, Booking } from "@/lib/types";

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: C.gold, bg: "#FBF2DF" },
  accepted: { label: "Confirmed", color: C.teal, bg: "#E4F2EF" },
  declined: { label: "Declined", color: C.grey, bg: C.greyLight },
  cancelled: { label: "Cancelled", color: C.grey, bg: C.greyLight },
};

// Read-only rundown of a single day: every booking on it, plus who's marked
// unavailable — opened by clicking a day in the admin's week/month calendar.
export function AdminDayModal({
  date,
  subs,
  teachers,
  requests,
  onClose,
}: {
  date: Date;
  subs: Sub[];
  teachers: Teacher[];
  requests: Booking[];
  onClose: () => void;
}) {
  const dk = dateKey(date);
  const dayRequests = requests.filter((r) => r.dk === dk).sort((a, b) => (a.status > b.status ? 1 : -1));

  const availableCount = subs.filter((s) => effectiveStatus(s.availability[dk]) === "available").length;
  const bookedCount = subs.filter((s) => effectiveStatus(s.availability[dk]) === "booked").length;
  const unavailableSubs = subs.filter((s) => effectiveStatus(s.availability[dk]) === "unavailable");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <p className="font-bold text-lg pr-6" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>
            {prettyDate(date)}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>
              {availableCount} available
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#FBF2DF", color: C.gold, fontFamily: "Barlow, sans-serif" }}>
              {bookedCount} booked
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#FDEBEC", color: C.red, fontFamily: "Barlow, sans-serif" }}>
              {unavailableSubs.length} unavailable
            </span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            Activity {dayRequests.length > 0 && `(${dayRequests.length})`}
          </p>
          {dayRequests.length === 0 ? (
            <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>No bookings on this date.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dayRequests.map((r) => {
                const sub = subs.find((s) => s.id === r.subId);
                const teacher = teachers.find((t) => t.id === r.teacherId);
                const meta = statusMeta[r.status] || statusMeta.pending;
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg p-2.5" style={{ backgroundColor: C.greyLight }}>
                    {sub && <AvatarPair primary={sub} secondary={teacher} size={36} />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                        {r.teacherName || "Unknown teacher"} → {sub ? sub.name : "Unknown substitute"}
                      </p>
                      {(r.subject || r.grade) && (
                        <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                          {[r.subject, r.grade].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                      style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "Barlow, sans-serif" }}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {unavailableSubs.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                Unavailable today
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unavailableSubs.map((s) => (
                  <span
                    key={s.id}
                    className="text-[11px] px-2 py-0.5 rounded-full border"
                    style={{ borderColor: C.red, color: C.red, fontFamily: "Barlow, sans-serif" }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
