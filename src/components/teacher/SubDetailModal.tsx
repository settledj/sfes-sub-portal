"use client";

import { useState } from "react";
import { X, Star, Phone, Mail, Check, Clock, CalendarPlus } from "lucide-react";
import { C, SUBJECTS } from "@/lib/constants";
import { dateKey, dkToDate, prettyDate } from "@/lib/dates";
import { effectiveStatus, isRequestable } from "@/lib/availability";
import { Avatar } from "@/components/shared/Avatar";
import { SubjectChip } from "@/components/shared/SubjectChip";
import { StatusPill } from "@/components/shared/StatusPill";
import { MiniCalendar } from "@/components/shared/MiniCalendar";
import type { Sub, Booking } from "@/lib/types";

function RequestDetailsForm({
  hint,
  reqSubject,
  setReqSubject,
  reqGrade,
  setReqGrade,
  reqNotes,
  setReqNotes,
  onSubmit,
  submitLabel,
  submitDisabled,
}: {
  hint?: string;
  reqSubject: string;
  setReqSubject: (s: string) => void;
  reqGrade: string;
  setReqGrade: (s: string) => void;
  reqNotes: string;
  setReqNotes: (s: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
}) {
  return (
    <div className="mt-4 rounded-lg p-4" style={{ border: `1px solid #E3E5EA` }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
        Request details {hint && <span style={{ fontWeight: 400 }}>{hint}</span>}
      </p>

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
        Subject you need covered
      </label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} active={reqSubject === s} onClick={() => setReqSubject(s)} tone={C.blue} />
        ))}
      </div>

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
        Grade level
      </label>
      <input
        value={reqGrade}
        onChange={(e) => setReqGrade(e.target.value)}
        placeholder="e.g., 3rd Grade"
        className="w-full text-sm rounded-lg border p-2 outline-none mb-3"
        style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
      />

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
        Additional info <span style={{ fontWeight: 400, color: C.grey }}>(optional)</span>
      </label>
      <textarea
        value={reqNotes}
        onChange={(e) => setReqNotes(e.target.value)}
        rows={3}
        placeholder="Where to find the lesson plan, timing, anything else the sub should know..."
        className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-4"
        style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
      />

      <button
        onClick={onSubmit}
        disabled={submitDisabled}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: C.red, fontFamily: "Barlow, sans-serif" }}
      >
        {submitLabel}
      </button>
    </div>
  );
}

export function SubDetailModal({
  sub,
  requests,
  closures,
  initialDate,
  onClose,
  onRequestSend,
  onMultiRequestSend,
}: {
  sub: Sub | undefined;
  requests: Booking[];
  closures?: Map<string, string>;
  initialDate: Date;
  onClose: () => void;
  onRequestSend: (subId: number, dk: string, details: { subject: string; grade: string; notes: string }) => void;
  onMultiRequestSend: (
    subId: number,
    dks: string[],
    details: { subject: string; grade: string; notes: string }
  ) => Promise<{ sent: string[]; conflicts: string[] }>;
}) {
  const [viewMonth, setViewMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [pickedDate, setPickedDate] = useState(initialDate);
  const [multiMode, setMultiMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [reqSubject, setReqSubject] = useState(sub?.subjects?.[0] || SUBJECTS[0]);
  const [reqGrade, setReqGrade] = useState("");
  const [reqNotes, setReqNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [multiResult, setMultiResult] = useState<{ sent: string[]; conflicts: string[] } | null>(null);

  if (!sub) return null;

  const dk = dateKey(pickedDate);
  const status = effectiveStatus(sub.availability[dk]);
  const closureReason = closures?.get(dk);
  // A cancelled request shouldn't keep blocking its date — cancelling is what
  // frees it back up (see the cancel API route, which clears availability).
  const existingRequest = requests.find((r) => r.subId === sub.id && r.dk === dk && r.status !== "cancelled");
  const canRequest = isRequestable(sub.availability[dk]) && !existingRequest && !closureReason;

  const isDateRequestable = (d: Date) => {
    const k = dateKey(d);
    return (
      isRequestable(sub.availability[k]) &&
      !requests.find((r) => r.subId === sub.id && r.dk === k && r.status !== "cancelled") &&
      !closures?.has(k)
    );
  };

  const toggleMultiMode = () => {
    setMultiResult(null);
    if (!multiMode) {
      setSelectedDates(canRequest ? new Set([dk]) : new Set());
    }
    setMultiMode(!multiMode);
  };

  const toggleDate = (d: Date) => {
    if (!isDateRequestable(d)) return;
    const k = dateKey(d);
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const sortedSelectedDates = [...selectedDates].sort();

  const handleSubmit = () => {
    onRequestSend(sub.id, dk, { subject: reqSubject, grade: reqGrade.trim(), notes: reqNotes.trim() });
  };

  const handleMultiSubmit = async () => {
    setSending(true);
    try {
      const result = await onMultiRequestSend(sub.id, sortedSelectedDates, {
        subject: reqSubject,
        grade: reqGrade.trim(),
        notes: reqNotes.trim(),
      });
      setMultiResult(result);
      setSelectedDates(new Set());
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(27,42,83,0.55)", WebkitOverflowScrolling: "touch" }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <Avatar sub={sub} size={64} showBadge badgeStatus={sub.availability[dateKey(new Date())]} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-lg truncate" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>
                  {sub.name}
                </p>
                {sub.preferred && <Star size={14} color={C.gold} fill={C.gold} />}
              </div>
              <p className="text-xs" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                Badge reflects today&apos;s status
              </p>
            </div>
          </div>

          {sub.bio && (
            <p className="text-sm mt-4 leading-relaxed" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>
              {sub.bio}
            </p>
          )}

          <div className="mt-4 space-y-1.5 text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            <p className="flex items-center gap-2"><Phone size={13} /> {sub.phone}</p>
            <p className="flex items-center gap-2"><Mail size={13} /> {sub.email}</p>
          </div>

          {(sub.division || []).length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                Division
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sub.division.map((d) => (
                  <span key={d} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: C.blue, color: C.blue, fontFamily: "Barlow, sans-serif" }}>
                    {d}
                  </span>
                ))}
              </div>
            </>
          )}

          {sub.subjects.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                Subjects
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sub.subjects.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.greyLight, color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          {sub.additionalInfo && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                Additional info
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                {sub.additionalInfo}
              </p>
            </>
          )}

          <div className="flex items-center justify-between mt-5 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
              Availability
            </p>
            <button
              onClick={toggleMultiMode}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: C.blue, fontFamily: "Barlow, sans-serif" }}
            >
              <CalendarPlus size={12} /> {multiMode ? "Single date" : "Select multiple dates"}
            </button>
          </div>
          <MiniCalendar
            sub={sub}
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
            isSelected={(k) => (multiMode ? selectedDates.has(k) : dk === k)}
            onSelect={multiMode ? toggleDate : setPickedDate}
            closures={closures}
          />

          {multiMode ? (
            <>
              <div className="mt-4 rounded-lg px-3 py-2.5" style={{ backgroundColor: C.greyLight }}>
                {sortedSelectedDates.length === 0 ? (
                  <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                    Tap available dates above to add them — you can send one request to cover all of them at once.
                  </p>
                ) : (
                  <>
                    <p className="text-xs mb-1.5" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                      {sortedSelectedDates.length} date{sortedSelectedDates.length > 1 ? "s" : ""} selected
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sortedSelectedDates.map((k) => (
                        <button
                          key={k}
                          onClick={() => toggleDate(dkToDate(k))}
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ backgroundColor: "white", color: C.navy, fontFamily: "Barlow, sans-serif", border: "1px solid #D9DCE3" }}
                        >
                          {prettyDate(dkToDate(k))} <X size={11} />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {multiResult && (
                <div
                  className="mt-3 w-full py-2 px-3 rounded-lg text-xs"
                  style={{
                    backgroundColor: multiResult.conflicts.length > 0 ? "#FBF2DF" : "#E4F2EF",
                    color: multiResult.conflicts.length > 0 ? "#7A6220" : C.teal,
                    fontFamily: "PT Serif, serif",
                  }}
                >
                  Sent for {multiResult.sent.length} of {multiResult.sent.length + multiResult.conflicts.length} date
                  {multiResult.sent.length + multiResult.conflicts.length > 1 ? "s" : ""}.
                  {multiResult.conflicts.length > 0 &&
                    ` Already had a request: ${multiResult.conflicts.map((k) => prettyDate(dkToDate(k))).join(", ")}.`}
                </div>
              )}

              {sortedSelectedDates.length > 0 && (
                <RequestDetailsForm
                  hint="(applies to every selected date)"
                  reqSubject={reqSubject}
                  setReqSubject={setReqSubject}
                  reqGrade={reqGrade}
                  setReqGrade={setReqGrade}
                  reqNotes={reqNotes}
                  setReqNotes={setReqNotes}
                  onSubmit={handleMultiSubmit}
                  submitDisabled={sending}
                  submitLabel={
                    sending ? "Sending…" : `Send request for ${sortedSelectedDates.length} date${sortedSelectedDates.length > 1 ? "s" : ""}`
                  }
                />
              )}
            </>
          ) : (
            <>
              <div className="mt-4 flex items-center justify-between rounded-lg px-3 py-2.5" style={{ backgroundColor: C.greyLight }}>
                <div>
                  <p className="text-xs" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>Selected date</p>
                  <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{prettyDate(pickedDate)}</p>
                </div>
                <StatusPill status={status} />
              </div>

              {existingRequest && (
                <div
                  className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5"
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    backgroundColor:
                      existingRequest.status === "accepted" ? C.teal : existingRequest.status === "pending" ? C.gold : C.greyLight,
                    color: existingRequest.status === "declined" ? C.grey : "white",
                  }}
                >
                  {existingRequest.status === "accepted" && <Check size={15} />}
                  {existingRequest.status === "pending" && <Clock size={15} />}
                  {existingRequest.status === "accepted"
                    ? "Confirmed"
                    : existingRequest.status === "pending"
                    ? "Request pending"
                    : "Declined — pick another date above to try again"}
                </div>
              )}

              {!existingRequest && !canRequest && (
                <div
                  className="mt-4 w-full py-2.5 rounded-lg text-sm text-center"
                  style={{ backgroundColor: C.greyLight, color: C.grey, fontFamily: "PT Serif, serif" }}
                >
                  {closureReason
                    ? `School is closed on this date (${closureReason}).`
                    : `${sub.name.split(" ")[0]} isn't available on this date. Pick a date shown in teal on the calendar above.`}
                </div>
              )}

              {canRequest && (
                <RequestDetailsForm
                  reqSubject={reqSubject}
                  setReqSubject={setReqSubject}
                  reqGrade={reqGrade}
                  setReqGrade={setReqGrade}
                  reqNotes={reqNotes}
                  setReqNotes={setReqNotes}
                  onSubmit={handleSubmit}
                  submitLabel="Submit request"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
