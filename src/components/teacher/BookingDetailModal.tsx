"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { C } from "@/lib/constants";
import { dkToDate, shortDateLabel } from "@/lib/dates";
import type { Sub, Booking } from "@/lib/types";

export function BookingDetailModal({
  booking,
  subs,
  onClose,
  onSaveDetails,
  onReassign,
}: {
  booking: Booking;
  subs: Sub[];
  onClose: () => void;
  onSaveDetails: (id: string, details: { lessonPlan: string; schedule: string; attendance: string; notes: string }) => void;
  onReassign: (id: string, newSubId: number) => void;
}) {
  const readOnly = booking.status === "cancelled" || booking.status === "declined";
  const [subId, setSubId] = useState(booking.subId);
  const [lessonPlan, setLessonPlan] = useState(booking.lessonPlan || "");
  const [schedule, setSchedule] = useState(booking.schedule || "");
  const [attendance, setAttendance] = useState(booking.attendance || "");
  const [notes, setNotes] = useState(booking.notes || "");
  const [savedFlash, setSavedFlash] = useState(false);

  const date = dkToDate(booking.dk);
  const currentSub = subs.find((s) => s.id === booking.subId);
  const newSub = subs.find((s) => s.id === subId);

  const handleSave = () => {
    onSaveDetails(booking.id, { lessonPlan, schedule, attendance, notes });
    if (subId !== booking.subId) onReassign(booking.id, subId);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            {date.toLocaleDateString(undefined, { weekday: "long" })}
          </p>
          <p className="text-lg font-bold mb-1" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
            {shortDateLabel(date)}
          </p>
          {(booking.subject || booking.grade) && (
            <p className="text-sm mb-4" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
              {[booking.subject, booking.grade].filter(Boolean).join(" · ")}
            </p>
          )}

          {readOnly ? (
            <div className="rounded-lg px-3 py-2.5 mb-2" style={{ backgroundColor: C.greyLight }}>
              <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                {currentSub?.name || "Unknown substitute"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                {booking.status === "cancelled" ? "This booking was cancelled." : "This substitute declined this date."}
              </p>
              {booking.notes && (
                <p className="text-xs mt-2" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>{booking.notes}</p>
              )}
            </div>
          ) : (
            <>
              {savedFlash && (
                <div className="mb-4 rounded-lg px-3 py-2 text-sm flex items-center gap-2" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>
                  <Check size={15} /> Saved
                </div>
              )}

              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Substitute
              </label>
              <select
                value={subId}
                onChange={(e) => setSubId(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 rounded-lg border outline-none mb-1"
                style={{ borderColor: "#D9DCE3", fontFamily: "Barlow, sans-serif" }}
              >
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {subId !== booking.subId ? (
                <p className="text-xs mb-3" style={{ color: C.gold, fontFamily: "PT Serif, serif" }}>
                  Saving will unassign {currentSub?.name || "the current sub"} and book {newSub?.name} for this date instead.
                </p>
              ) : (
                <div className="mb-3" />
              )}

              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Lesson plan / materials
              </label>
              <textarea
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
                rows={3}
                placeholder="What to teach, where materials are located..."
                className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
              />

              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Daily schedule
              </label>
              <textarea
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                rows={3}
                placeholder="Period-by-period schedule, bell times, specials..."
                className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
              />

              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Attendance & procedures
              </label>
              <textarea
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                rows={2}
                placeholder="How to take attendance, dismissal procedure, allergies..."
                className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
              />

              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Additional info
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Anything else the sub should know..."
                className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-4"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
              />

              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
              >
                Save details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
