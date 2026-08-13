"use client";

import { X } from "lucide-react";
import { C } from "@/lib/constants";
import { dateKey, shortDateLabel } from "@/lib/dates";
import { effectiveStatus } from "@/lib/availability";
import type { Sub, Booking } from "@/lib/types";

export function SubDayModal({
  sub,
  date,
  requests,
  onClose,
  onSetStatus,
}: {
  sub: Sub;
  date: Date;
  requests: Booking[];
  onClose: () => void;
  onSetStatus: (dk: string, status: "available" | "unavailable") => void;
}) {
  const dk = dateKey(date);
  const status = effectiveStatus(sub.availability[dk]);
  const booking = requests.find((r) => r.subId === sub.id && r.dk === dk && r.status === "accepted");

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

        {status === "booked" && booking ? (
          <div>
            <span
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
              style={{ backgroundColor: "#FBF2DF", color: C.gold, fontFamily: "Barlow, sans-serif" }}
            >
              Booked
            </span>
            <p className="text-xs" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>Subbing for</p>
            <p className="font-bold text-lg mb-2" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
              {booking.teacherName || "Unknown teacher"}
            </p>
            {(booking.subject || booking.grade) && (
              <p className="text-sm mb-2" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                {[booking.subject, booking.grade].filter(Boolean).join(" · ")}
              </p>
            )}

            {booking.lessonPlan && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                  Lesson plan / materials
                </p>
                <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: C.greyLight, color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                  {booking.lessonPlan}
                </p>
              </>
            )}

            {booking.schedule && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                  Daily schedule
                </p>
                <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: C.greyLight, color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                  {booking.schedule}
                </p>
              </>
            )}

            {booking.attendance && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                  Attendance & procedures
                </p>
                <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: C.greyLight, color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                  {booking.attendance}
                </p>
              </>
            )}

            {booking.notes && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                  Additional info
                </p>
                <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: C.greyLight, color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                  {booking.notes}
                </p>
              </>
            )}
          </div>
        ) : status === "booked" ? (
          <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            Booked, but details weren&apos;t found for this one.
          </p>
        ) : (
          <div>
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
        )}
      </div>
    </div>
  );
}
