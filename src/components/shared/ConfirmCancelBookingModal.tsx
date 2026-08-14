"use client";

import { AlertTriangle, X } from "lucide-react";
import { C } from "@/lib/constants";
import { dkToDate, prettyDate } from "@/lib/dates";
import type { Booking } from "@/lib/types";

// Shared confirmation step in front of every "cancel a booking" action
// (teacher's own schedule, admin's bookings list) so a stray click can't
// silently cancel someone's coverage.
export function ConfirmCancelBookingModal({
  booking,
  subName,
  onConfirm,
  onClose,
}: {
  booking: Booking;
  subName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} color={C.red} />
            <p className="font-bold text-lg" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>
              Cancel this booking?
            </p>
          </div>

          <div className="rounded-lg px-3 py-2.5 mb-3" style={{ backgroundColor: C.greyLight }}>
            <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
              {prettyDate(dkToDate(booking.dk))}
            </p>
            <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
              {booking.teacherName || "Unknown teacher"} → {subName}
              {(booking.subject || booking.grade) && ` · ${[booking.subject, booking.grade].filter(Boolean).join(" · ")}`}
            </p>
          </div>

          <p className="text-sm mb-5" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>
            Are you sure you want to cancel this booking? The teacher and substitute will both be notified by email.
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
              style={{ color: C.navy, border: "1.5px solid #D9DCE3", fontFamily: "Barlow, sans-serif" }}
            >
              Keep booking
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: C.red, fontFamily: "Barlow, sans-serif" }}
            >
              Cancel booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
