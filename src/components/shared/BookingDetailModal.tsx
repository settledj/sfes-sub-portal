"use client";

import { useEffect, useState } from "react";
import { X, Check, Send, Mail, Ban, RefreshCw } from "lucide-react";
import { PhoneActions } from "@/components/shared/PhoneActions";
import { C, bookingBadgeMeta } from "@/lib/constants";
import { dkToDate, prettyDate } from "@/lib/dates";
import { fetchMessages, sendMessage } from "@/lib/api";
import { AvatarPair } from "@/components/shared/Avatar";
import { ConfirmCancelBookingModal } from "@/components/shared/ConfirmCancelBookingModal";
import type { Sub, Teacher, Booking, Message, PortalRole } from "@/lib/types";

const roleLabel: Record<PortalRole, string> = { teacher: "Teacher", substitute: "Substitute", admin: "Admin" };

// The single, centralized booking detail experience — every place a booking
// appears (teacher schedule, admin bookings/day view, substitute portal)
// opens this same component. What's shown and editable is driven entirely
// by `role` and which optional action callbacks the caller passes in, not
// by separate per-portal copies of this UI.
export function BookingDetailModal({
  booking,
  teacher,
  sub,
  subs,
  role,
  currentUserName,
  onClose,
  onSaveDetails,
  onReassign,
  onCancel,
  onRequestCancel,
  onApproveCancel,
  onDenyCancel,
  onRespond,
  onSubmitFeedback,
}: {
  booking: Booking;
  teacher: Teacher | undefined;
  sub: Sub | undefined;
  subs?: Sub[];
  role: PortalRole;
  currentUserName: string;
  onClose: () => void;
  onSaveDetails?: (id: string, details: { lessonPlan: string; schedule: string; attendance: string; notes: string }) => void;
  onReassign?: (id: string, newSubId: number) => void;
  onCancel?: (id: string) => void;
  onRequestCancel?: (id: string) => void;
  onApproveCancel?: (id: string) => void;
  onDenyCancel?: (id: string) => void;
  onRespond?: (id: string, accept: boolean) => void;
  onSubmitFeedback?: (id: string, feedback: string) => void | Promise<void>;
}) {
  const [newSubId, setNewSubId] = useState(booking.subId);
  const [lessonPlan, setLessonPlan] = useState(booking.lessonPlan || "");
  const [schedule, setSchedule] = useState(booking.schedule || "");
  const [attendance, setAttendance] = useState(booking.attendance || "");
  const [notes, setNotes] = useState(booking.notes || "");
  const [savedFlash, setSavedFlash] = useState(false);

  const [feedback, setFeedback] = useState(booking.subFeedback || "");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [messagesError, setMessagesError] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMessages(booking.id)
      .then((m) => !cancelled && setMessages(m))
      .catch(() => !cancelled && setMessagesError(true));
    return () => {
      cancelled = true;
    };
  }, [booking.id]);

  const date = dkToDate(booking.dk);
  const meta = bookingBadgeMeta(booking);
  const isTerminal = booking.status === "cancelled" || booking.status === "declined";
  const hasPendingCancelRequest = !!booking.cancelRequestedAt && !isTerminal;

  const canEditDetails = (role === "teacher" || role === "admin") && !isTerminal && !!onSaveDetails;
  const canReassign = (role === "teacher" || role === "admin") && !isTerminal && !!onReassign && !!subs?.length;
  const canRespond = (role === "substitute" || role === "admin") && booking.status === "pending" && !!onRespond;
  const canCancelDirect = role === "admin" && !isTerminal && !!onCancel;
  const canRequestCancel = (role === "teacher" || role === "substitute") && !isTerminal && !hasPendingCancelRequest && !!onRequestCancel;
  const canDecideCancelRequest = role === "admin" && hasPendingCancelRequest && !!onApproveCancel && !!onDenyCancel;
  const canEditFeedback = booking.status === "accepted" && (role === "substitute" || role === "admin") && !!onSubmitFeedback;
  const showFeedback = booking.status === "accepted" && (role === "teacher" || canEditFeedback);

  const handleSaveDetails = () => {
    onSaveDetails?.(booking.id, { lessonPlan, schedule, attendance, notes });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const handleChangeSub = () => {
    if (newSubId !== booking.subId) onReassign?.(booking.id, newSubId);
  };

  const handleSaveFeedback = async () => {
    if (!onSubmitFeedback) return;
    setFeedbackSaving(true);
    try {
      await onSubmitFeedback(booking.id, feedback);
      setFeedbackSaved(true);
      setTimeout(() => setFeedbackSaved(false), 1200);
    } finally {
      setFeedbackSaving(false);
    }
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const message = await sendMessage(booking.id, text);
      setMessages((prev) => [...(prev || []), message]);
      setDraft("");
    } catch {
      // Swallow — the draft stays in the box so the user can just retry.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <div className="flex items-center gap-2 mb-1 pr-6">
            <p className="text-lg font-bold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
              {prettyDate(date)}
            </p>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "Barlow, sans-serif" }}
            >
              {meta.label}
            </span>
          </div>
          {(booking.subject || booking.grade) && (
            <p className="text-sm mb-4" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
              {[booking.subject, booking.grade].filter(Boolean).join(" · ")}
            </p>
          )}

          {role !== "substitute" && (
            <div className="flex items-center gap-3 mt-3 mb-3">
              {sub && teacher ? <AvatarPair primary={sub} secondary={teacher} size={44} /> : null}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                  Substitute
                </p>
                <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                  {sub?.name || "Unknown substitute"}
                </p>
                {sub && (
                  <div className="flex flex-wrap items-center gap-3 text-xs mt-0.5" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                    <PhoneActions phone={sub.phone} size={11} />
                    <span className="flex items-center gap-1"><Mail size={11} /> {sub.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {role !== "teacher" && (
            <div className="flex items-center gap-3 mt-1 mb-4">
              {teacher && <AvatarPair primary={teacher} size={44} />}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                  Teacher
                </p>
                <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                  {booking.teacherName || teacher?.name || "Unknown teacher"}
                </p>
                {teacher && (
                  <div className="flex flex-wrap items-center gap-3 text-xs mt-0.5" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                    {teacher.room && <span>{teacher.room}</span>}
                    <span className="flex items-center gap-1"><Mail size={11} /> {teacher.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {canRespond && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => onRespond?.(booking.id, true)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-1.5"
                style={{ backgroundColor: C.teal, fontFamily: "Barlow, sans-serif" }}
              >
                <Check size={15} /> Accept
              </button>
              <button
                onClick={() => onRespond?.(booking.id, false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: "white", color: C.grey, border: "1px solid #D9DCE3", fontFamily: "Barlow, sans-serif" }}
              >
                Decline
              </button>
            </div>
          )}

          {isTerminal && (
            <div className="rounded-lg px-3 py-2.5 mb-4" style={{ backgroundColor: C.greyLight }}>
              <p className="text-xs" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                {booking.status === "cancelled" ? "This booking was cancelled." : "This substitute declined this date."}
              </p>
            </div>
          )}

          {hasPendingCancelRequest && (
            <div className="rounded-lg px-3 py-2.5 mb-4" style={{ backgroundColor: "#FBF2DF" }}>
              <p className="text-xs mb-1" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                {booking.cancelRequestedBy ? roleLabel[booking.cancelRequestedBy] : "Someone"} asked to cancel this booking — it stays on the calendar
                until the office decides.
              </p>
              {canDecideCancelRequest && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onApproveCancel?.(booking.id)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white"
                    style={{ backgroundColor: C.red, fontFamily: "Barlow, sans-serif" }}
                  >
                    <Ban size={13} /> Approve cancellation
                  </button>
                  <button
                    onClick={() => onDenyCancel?.(booking.id)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md"
                    style={{ backgroundColor: "white", color: C.navy, border: "1px solid #D9DCE3", fontFamily: "Barlow, sans-serif" }}
                  >
                    <Check size={13} /> Keep booking
                  </button>
                </div>
              )}
            </div>
          )}

          {canEditDetails ? (
            <>
              {savedFlash && (
                <div className="mb-3 rounded-lg px-3 py-2 text-sm flex items-center gap-2" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>
                  <Check size={15} /> Saved
                </div>
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
                className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
              />
              <button
                onClick={handleSaveDetails}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mb-2"
                style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
              >
                Save details
              </button>
            </>
          ) : (
            !isTerminal && (
              <>
                {[
                  ["Lesson plan / materials", booking.lessonPlan],
                  ["Daily schedule", booking.schedule],
                  ["Attendance & procedures", booking.attendance],
                  ["Additional info", booking.notes],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs font-semibold uppercase tracking-widest mt-3 mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                        {label}
                      </p>
                      <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: C.greyLight, color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                        {value}
                      </p>
                    </div>
                  ))}
              </>
            )
          )}

          {canReassign && (
            <>
              <label className="text-xs font-semibold block mb-1.5 mt-2" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Change substitute
              </label>
              <div className="flex gap-2 mb-1">
                <select
                  value={newSubId}
                  onChange={(e) => setNewSubId(Number(e.target.value))}
                  className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none"
                  style={{ borderColor: "#D9DCE3", fontFamily: "Barlow, sans-serif" }}
                >
                  {subs!.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleChangeSub}
                  disabled={newSubId === booking.subId}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
                  style={{ backgroundColor: C.blue, fontFamily: "Barlow, sans-serif" }}
                >
                  <RefreshCw size={13} /> Change
                </button>
              </div>
              {newSubId !== booking.subId ? (
                <p className="text-xs mb-3" style={{ color: C.gold, fontFamily: "PT Serif, serif" }}>
                  This will unassign {sub?.name || "the current sub"} and book {subs!.find((s) => s.id === newSubId)?.name} instead.
                </p>
              ) : (
                <div className="mb-3" />
              )}
            </>
          )}

          {(canCancelDirect || canRequestCancel) && (
            <button
              onClick={() => setConfirmingCancel(true)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold mt-1 mb-2"
              style={{ color: C.red, border: `1.5px solid ${C.red}`, fontFamily: "Barlow, sans-serif" }}
            >
              {canCancelDirect ? "Cancel booking" : "Request cancellation"}
            </button>
          )}

          {showFeedback && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                End-of-day report
              </p>
              {canEditFeedback ? (
                <>
                  {feedbackSaved && (
                    <div className="mb-2 rounded-lg px-3 py-2 text-sm flex items-center gap-2" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>
                      <Check size={15} /> Saved
                    </div>
                  )}
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    placeholder="How the day went — student behavior, what got covered, what didn't, questions for the teacher, anything else they should know..."
                    className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-2"
                    style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
                  />
                  <button
                    onClick={handleSaveFeedback}
                    disabled={feedbackSaving}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                    style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
                  >
                    {feedbackSaving ? "Saving…" : "Save report"}
                  </button>
                </>
              ) : booking.subFeedback ? (
                <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: C.greyLight, color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                  {booking.subFeedback}
                </p>
              ) : (
                <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                  No report submitted yet.
                </p>
              )}
            </>
          )}

          <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            Messages
          </p>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto mb-2">
            {messages === null && !messagesError && (
              <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>Loading…</p>
            )}
            {messagesError && (
              <p className="text-xs" style={{ color: C.red, fontFamily: "PT Serif, serif" }}>Couldn&apos;t load messages.</p>
            )}
            {messages?.length === 0 && (
              <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                No messages yet — say hello.
              </p>
            )}
            {messages?.map((m) => (
              <div key={m.id} className="rounded-lg px-3 py-2" style={{ backgroundColor: C.greyLight }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{m.senderName}</p>
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                    {roleLabel[m.senderRole]}
                  </span>
                  <span className="text-[10px] ml-auto whitespace-nowrap" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                    {new Date(m.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>{m.body}</p>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder={`Message as ${currentUserName}...`}
              className="flex-1 text-sm rounded-lg border p-2 outline-none resize-none"
              style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !draft.trim()}
              className="p-2.5 rounded-lg text-white disabled:opacity-40 shrink-0"
              style={{ backgroundColor: C.navy }}
              title="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {confirmingCancel && (
        <ConfirmCancelBookingModal
          booking={booking}
          subName={sub?.name || "Unknown substitute"}
          mode={canCancelDirect ? "cancel" : "request"}
          onClose={() => setConfirmingCancel(false)}
          onConfirm={() => {
            if (canCancelDirect) onCancel?.(booking.id);
            else onRequestCancel?.(booking.id);
            setConfirmingCancel(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}
