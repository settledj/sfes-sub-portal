"use client";

import { useMemo, useState } from "react";
import { LogOut, Star, Phone, Mail, Grid3x3, ClipboardList, ChevronLeft, ChevronRight, Check, Ban, Bell, MessageCircle } from "lucide-react";
import { C, SUBJECTS, DIVISIONS, bookingBadgeMeta } from "@/lib/constants";
import { dateKey, dkToDate, prettyDate } from "@/lib/dates";
import { effectiveStatus } from "@/lib/availability";
import { EditableAvatar } from "@/components/shared/Avatar";
import { EditableField } from "@/components/shared/EditableField";
import { SubjectChip } from "@/components/shared/SubjectChip";
import { NotificationPreferences } from "@/components/shared/NotificationPreferences";
import { MessagesInboxModal } from "@/components/shared/MessagesInboxModal";
import { SubDayModal } from "@/components/sub/SubDayModal";
import { BookingDetailModal } from "@/components/shared/BookingDetailModal";
import type { Sub, Teacher, Booking, SchoolClosure } from "@/lib/types";

export function SubPortal({
  sub,
  teachers,
  requests,
  closures,
  respondRequest,
  onRequestCancel,
  onLogout,
  onUpdateProfile,
  onSetDayStatus,
  onPhotoChange,
  onSubmitFeedback,
}: {
  sub: Sub;
  teachers: Teacher[];
  requests: Booking[];
  closures: SchoolClosure[];
  respondRequest: (requestId: string, accept: boolean) => void;
  onRequestCancel: (requestId: string) => void;
  onLogout: () => void;
  onUpdateProfile: (
    updates: Partial<Pick<Sub, "bio" | "subjects" | "division" | "additionalInfo" | "phone" | "notifyBookingUpdates" | "notifyMessages">>
  ) => void;
  onSetDayStatus: (dk: string, status: "available" | "unavailable") => void;
  onPhotoChange: (dataUri: string) => void;
  onSubmitFeedback: (id: string, feedback: string) => Promise<void>;
}) {
  const closuresMap = useMemo(() => new Map(closures.map((c) => [c.dk, c.reason])), [closures]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [openDate, setOpenDate] = useState<Date | null>(null);
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const [calendarViewMode, setCalendarViewMode] = useState<"month" | "list">("month");
  const [listStatusFilter, setListStatusFilter] = useState("all");
  const [showPreferences, setShowPreferences] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const myRequests = requests.filter((r) => r.subId === sub.id).sort((a, b) => (a.dk > b.dk ? 1 : -1));
  const openBooking = myRequests.find((r) => r.id === openBookingId);
  const pending = myRequests.filter((r) => r.status === "pending");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const upcoming = myRequests.filter((r) => r.status === "accepted" && dkToDate(r.dk) >= todayStart).slice(0, 2);

  const filteredListRequests = myRequests.filter((r) => {
    if (listStatusFilter === "all") return true;
    if (listStatusFilter === "confirmed") return r.status === "accepted" && dkToDate(r.dk) >= todayStart;
    if (listStatusFilter === "completed") return r.status === "accepted" && dkToDate(r.dk) < todayStart;
    return r.status === listStatusFilter;
  });

  const toggleSubject = (subject: string) => {
    const has = sub.subjects.includes(subject);
    onUpdateProfile({ subjects: has ? sub.subjects.filter((x) => x !== subject) : [...sub.subjects, subject] });
  };

  const toggleDivision = (division: string) => {
    const current = sub.division || [];
    const has = current.includes(division);
    onUpdateProfile({ division: has ? current.filter((x) => x !== division) : [...current, division] });
  };

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const shiftMonth = (delta: number) => setCalendarMonth(new Date(year, month + delta, 1));

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <EditableAvatar person={sub} size={40} onPhotoChange={onPhotoChange} />
          <div>
            <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{sub.name}</p>
            <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>{(sub.division || []).join(", ") || "Substitute"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMessages(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
            style={{ color: C.navy, fontFamily: "Barlow, sans-serif", border: `1.5px solid #D9DCE3` }}
          >
            <MessageCircle size={14} /> Messages
          </button>
          <button
            onClick={() => setShowPreferences((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
            style={{ color: C.navy, fontFamily: "Barlow, sans-serif", border: `1.5px solid #D9DCE3` }}
          >
            <Bell size={14} /> Notifications
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
            style={{ color: C.navy, fontFamily: "Barlow, sans-serif", border: `1.5px solid #D9DCE3` }}
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>

      {showPreferences && (
        <div className="mb-6">
          <NotificationPreferences
            notifyBookingUpdates={sub.notifyBookingUpdates}
            notifyMessages={sub.notifyMessages}
            onChange={onUpdateProfile}
          />
        </div>
      )}

      {pending.length > 0 && (
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "#FBF2DF", border: `1px solid #EFDDB0` }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.gold, fontFamily: "Barlow, sans-serif" }}>
            Requests waiting on you
          </p>
          <div className="flex flex-col gap-2">
            {pending.map((r) => {
              const date = dkToDate(r.dk);
              return (
                <div
                  key={r.id}
                  onClick={() => setOpenBookingId(r.id)}
                  className="bg-white rounded-lg px-3 py-2.5 flex flex-col gap-2 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                      {prettyDate(date)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          respondRequest(r.id, true);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white"
                        style={{ backgroundColor: C.teal, fontFamily: "Barlow, sans-serif" }}
                      >
                        <Check size={13} /> Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          respondRequest(r.id, false);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md"
                        style={{ backgroundColor: "white", color: C.grey, border: "1px solid #D9DCE3", fontFamily: "Barlow, sans-serif" }}
                      >
                        <Ban size={13} /> Decline
                      </button>
                    </div>
                  </div>
                  {(r.subject || r.grade || r.notes) && (
                    <div className="text-xs rounded-md px-2.5 py-2" style={{ backgroundColor: C.greyLight, color: "#3F4552", fontFamily: "PT Serif, serif" }}>
                      {(r.subject || r.grade) && (
                        <p className="font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                          {[r.subject, r.grade].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {r.notes && <p className="mt-0.5">{r.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "#E4F2EF", border: `1px solid #BFE1DA` }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.teal, fontFamily: "Barlow, sans-serif" }}>
            Upcoming bookings
          </p>
          <div className="flex flex-col gap-2">
            {upcoming.map((r) => (
              <button
                key={r.id}
                onClick={() => setOpenBookingId(r.id)}
                className="w-full text-left bg-white rounded-lg px-3 py-2.5 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                    {prettyDate(dkToDate(r.dk))}
                  </p>
                  <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                    {r.teacherName || "Unknown teacher"}
                    {(r.subject || r.grade) && ` · ${[r.subject, r.grade].filter(Boolean).join(" · ")}`}
                  </p>
                </div>
                <span className="text-xs font-semibold whitespace-nowrap" style={{ color: C.teal, fontFamily: "Barlow, sans-serif" }}>
                  Booked
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#E3E5EA" }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="font-bold" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>
              {calendarViewMode === "month" ? calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "All bookings"}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center rounded-lg p-1" style={{ backgroundColor: C.greyLight }}>
                <button
                  onClick={() => setCalendarViewMode("month")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
                  style={{ fontFamily: "Barlow, sans-serif", backgroundColor: calendarViewMode === "month" ? C.navy : "transparent", color: calendarViewMode === "month" ? "white" : C.grey }}
                >
                  <Grid3x3 size={13} /> Month
                </button>
                <button
                  onClick={() => setCalendarViewMode("list")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
                  style={{ fontFamily: "Barlow, sans-serif", backgroundColor: calendarViewMode === "list" ? C.navy : "transparent", color: calendarViewMode === "list" ? "white" : C.grey }}
                >
                  <ClipboardList size={13} /> List
                </button>
              </div>
              {calendarViewMode === "month" ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronLeft size={18} color={C.navy} /></button>
                  <button onClick={() => shiftMonth(1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronRight size={18} color={C.navy} /></button>
                </div>
              ) : (
                <select
                  value={listStatusFilter}
                  onChange={(e) => setListStatusFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border outline-none"
                  style={{ borderColor: "#D9DCE3", color: C.navy, fontFamily: "Barlow, sans-serif" }}
                >
                  <option value="all">All bookings</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed (upcoming)</option>
                  <option value="completed">Completed (past)</option>
                  <option value="declined">Declined</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>
          </div>

          {calendarViewMode === "list" ? (
            <div>
              <p className="text-xs mb-3" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                Every request and booking on your record, most recent first.
              </p>
              {filteredListRequests.length === 0 ? (
                <div className="rounded-xl p-8 text-center" style={{ backgroundColor: C.greyLight }}>
                  <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                    {myRequests.length === 0 ? "No bookings yet." : "No bookings match this filter."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredListRequests.map((r) => {
                    const meta = bookingBadgeMeta(r);
                    return (
                      <button
                        key={r.id}
                        onClick={() => setOpenBookingId(r.id)}
                        className="w-full text-left rounded-lg border px-3 py-2.5 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
                        style={{ borderColor: "#E3E5EA" }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                            {prettyDate(dkToDate(r.dk))}
                          </p>
                          <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                            {r.teacherName || "Unknown teacher"}
                            {(r.subject || r.grade) && ` · ${[r.subject, r.grade].filter(Boolean).join(" · ")}`}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "Barlow, sans-serif" }}>
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs mb-3" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                You&apos;re available by default. Tap a date to see details or set your status.
              </p>

              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-center text-[11px] font-semibold" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((day, idx) => {
                  if (day === null) return <div key={idx} />;
                  const d = new Date(year, month, day);
                  const dk = dateKey(d);
                  const status = effectiveStatus(sub.availability[dk]);
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const closureReason = closuresMap.get(dk);
                  const isClosed = !!closureReason;
                  const isDisabled = isWeekend || isClosed;
                  const bg = isDisabled ? "#F2F3F5" : status === "booked" ? C.gold : status === "unavailable" ? C.red : C.teal;
                  const textColor = isDisabled ? "#B7BAC2" : "white";
                  const dayBooking = myRequests.find((r) => r.dk === dk && r.status === "accepted");
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isDisabled) return;
                        if (dayBooking) setOpenBookingId(dayBooking.id);
                        else setOpenDate(d);
                      }}
                      disabled={isDisabled}
                      title={closureReason || (status === "booked" ? "Booked — tap to see details" : "Tap to view or change")}
                      className="aspect-square rounded-lg text-sm font-medium flex items-center justify-center border transition-colors"
                      style={{
                        backgroundColor: bg,
                        color: textColor,
                        borderColor: isDisabled ? "#E3E5EA" : bg,
                        fontFamily: "Barlow, sans-serif",
                        cursor: isDisabled ? "default" : "pointer",
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: C.teal }} /> Available (default)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: C.red }} /> Unavailable</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ backgroundColor: C.gold }} /> Booked</span>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5" style={{ borderColor: "#E3E5EA" }}>
          <div className="flex items-center gap-3">
            <EditableAvatar person={sub} size={56} onPhotoChange={onPhotoChange} />
            <div>
              <p className="font-bold text-lg" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>{sub.name}</p>
              {sub.preferred && (
                <p className="text-xs font-semibold flex items-center gap-1 mt-0.5" style={{ color: C.gold }}>
                  <Star size={12} fill={C.gold} /> Preferred substitute
                </p>
              )}
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            Bio <span style={{ fontWeight: 400, color: C.grey }}>(optional)</span>
          </p>
          <EditableField
            value={sub.bio}
            placeholder="Add a short bio for teachers to see..."
            emptyLabel="Add a short bio for teachers to see..."
            multiline
            onSave={(bio) => onUpdateProfile({ bio })}
          />

          <div className="mt-4 space-y-1.5 text-sm" style={{ fontFamily: "PT Serif, serif", color: C.grey }}>
            <div className="flex items-center gap-2">
              <Phone size={13} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <EditableField
                  value={sub.phone}
                  placeholder="(555) 555-5555"
                  emptyLabel="Add a phone number"
                  type="tel"
                  onSave={(phone) => onUpdateProfile({ phone })}
                />
              </div>
            </div>
            <p className="flex items-center gap-2"><Mail size={13} /> {sub.email}</p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            Divisions I can cover
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DIVISIONS.map((d) => (
              <SubjectChip key={d} label={d} active={(sub.division || []).includes(d)} onClick={() => toggleDivision(d)} tone={C.blue} />
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            Subjects I can cover
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <SubjectChip key={s} label={s} active={sub.subjects.includes(s)} onClick={() => toggleSubject(s)} tone={C.blue} />
            ))}
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            Additional info
          </p>
          <textarea
            defaultValue={sub.additionalInfo || ""}
            onBlur={(e) => onUpdateProfile({ additionalInfo: e.target.value })}
            rows={2}
            placeholder="Scheduling notes, coaching conflicts, notice needed, etc."
            className="w-full text-sm rounded-lg border p-2 outline-none resize-none"
            style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
          />
        </div>
      </div>

      {openDate && (
        <SubDayModal sub={sub} date={openDate} onClose={() => setOpenDate(null)} onSetStatus={onSetDayStatus} />
      )}

      {openBooking && (
        <BookingDetailModal
          booking={openBooking}
          teacher={teachers.find((t) => t.id === openBooking.teacherId)}
          sub={sub}
          role="substitute"
          currentUserName={sub.name}
          onClose={() => setOpenBookingId(null)}
          onRespond={respondRequest}
          onRequestCancel={onRequestCancel}
          onSubmitFeedback={onSubmitFeedback}
        />
      )}

      {showMessages && (
        <MessagesInboxModal
          requests={requests}
          subs={[sub]}
          teachers={teachers}
          role="substitute"
          mySubId={sub.id}
          onClose={() => setShowMessages(false)}
          onOpenBooking={setOpenBookingId}
        />
      )}
    </div>
  );
}
