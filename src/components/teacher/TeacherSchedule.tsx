"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import { C } from "@/lib/constants";
import { dkToDate, prettyDate } from "@/lib/dates";
import { Avatar } from "@/components/shared/Avatar";
import { BookingDetailModal } from "@/components/teacher/BookingDetailModal";
import type { Sub, Booking } from "@/lib/types";

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: C.gold, bg: "#FBF2DF" },
  accepted: { label: "Confirmed", color: C.teal, bg: "#E4F2EF" },
  declined: { label: "Declined", color: C.grey, bg: C.greyLight },
  cancelled: { label: "Cancelled", color: C.grey, bg: C.greyLight },
};

// Used both from the teacher's own "List view" and the admin's teacher-detail modal.
export function TeacherSchedule({
  teacherId,
  requests,
  subs,
  onCancel,
  onSaveDetails,
  onReassign,
}: {
  teacherId: number;
  requests: Booking[];
  subs: Sub[];
  onCancel: (id: string) => void;
  onSaveDetails: (id: string, details: { lessonPlan: string; schedule: string; attendance: string; notes: string }) => void;
  onReassign: (id: string, newSubId: number) => void;
}) {
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const mine = requests.filter((r) => r.teacherId === teacherId).sort((a, b) => (a.dk > b.dk ? 1 : -1));

  if (mine.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center" style={{ borderColor: "#E3E5EA" }}>
        <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          No sub requests yet. Head to &quot;Find a Sub&quot; to request coverage for an upcoming date.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {mine.map((r) => {
        const sub = subs.find((s) => s.id === r.subId);
        const date = dkToDate(r.dk);
        const meta = statusMeta[r.status] || statusMeta.pending;
        const canCancel = r.status === "pending" || r.status === "accepted";
        return (
          <div
            key={r.id}
            onClick={() => setOpenBookingId(r.id)}
            className="rounded-xl border bg-white p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            style={{ borderColor: "#E3E5EA", opacity: r.status === "cancelled" || r.status === "declined" ? 0.7 : 1 }}
          >
            {sub && <Avatar sub={sub} size={44} showBadge badgeStatus={r.status === "accepted" ? "booked" : undefined} />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                {prettyDate(date)}
              </p>
              <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                {sub ? sub.name : "Unknown substitute"}
                {(r.subject || r.grade) && ` · ${[r.subject, r.grade].filter(Boolean).join(" · ")}`}
              </p>
              {r.notes && (
                <p className="text-xs mt-0.5" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>{r.notes}</p>
              )}
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "Barlow, sans-serif" }}
            >
              {meta.label}
            </span>
            {canCancel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(r.id);
                }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-md flex items-center gap-1 whitespace-nowrap"
                style={{ color: C.red, border: `1.5px solid ${C.red}`, fontFamily: "Barlow, sans-serif" }}
              >
                <XCircle size={13} /> Cancel
              </button>
            )}
          </div>
        );
      })}

      {openBookingId && (
        <BookingDetailModal
          booking={mine.find((r) => r.id === openBookingId)!}
          subs={subs}
          onClose={() => setOpenBookingId(null)}
          onSaveDetails={onSaveDetails}
          onReassign={onReassign}
        />
      )}
    </div>
  );
}
