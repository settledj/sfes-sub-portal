"use client";

import { useMemo, useState } from "react";
import { Search, Star, Phone, ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Grid3x3, ClipboardList } from "lucide-react";
import { C, SUBJECTS, DIVISIONS } from "@/lib/constants";
import { addDays, dateKey, prettyDate, startOfWeek, toInputValue } from "@/lib/dates";
import { effectiveStatus, isRequestable } from "@/lib/availability";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill } from "@/components/shared/StatusPill";
import { SubjectChip } from "@/components/shared/SubjectChip";
import { WeekStrip } from "@/components/shared/WeekStrip";
import { MonthGrid } from "@/components/shared/MonthGrid";
import { SubDetailModal } from "@/components/teacher/SubDetailModal";
import { TeacherSchedule } from "@/components/teacher/TeacherSchedule";
import type { Sub, Booking } from "@/lib/types";

export function TeacherDashboard({
  subs,
  requests,
  sendRequest,
  sendMultiRequest,
  teacherId,
  onCancelBooking,
  onOpenBooking,
}: {
  subs: Sub[];
  requests: Booking[];
  sendRequest: (subId: number, dk: string, details: { subject: string; grade: string; notes: string }) => void;
  sendMultiRequest: (
    subId: number,
    dks: string[],
    details: { subject: string; grade: string; notes: string }
  ) => Promise<{ sent: string[]; conflicts: string[] }>;
  teacherId: number;
  onCancelBooking: (id: string) => void;
  onOpenBooking: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [openSubId, setOpenSubId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "month" | "list">("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const today = new Date();
  const isToday = dateKey(selectedDate) === dateKey(today);
  const dk = dateKey(selectedDate);

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
      const matchesSubject = subjectFilter === "All" || s.subjects.length === 0 || s.subjects.includes(subjectFilter);
      const matchesDivision = divisionFilter === "All" || (s.division || []).includes(divisionFilter);
      return matchesQuery && matchesSubject && matchesDivision;
    });
  }, [subs, query, subjectFilter, divisionFilter]);

  const availableCount = filtered.filter((s) => isRequestable(s.availability[dk])).length;

  const bookedDates = useMemo(
    () => new Set(requests.filter((r) => r.teacherId === teacherId && r.status === "accepted").map((r) => r.dk)),
    [requests, teacherId]
  );

  const sorted = [...filtered].sort((a, b) => {
    const rank = (s: Sub) => {
      const st = effectiveStatus(s.availability[dk]);
      return st === "available" ? 0 : st === "booked" ? 1 : 2;
    };
    const byAvail = rank(a) - rank(b);
    if (byAvail !== 0) return byAvail;
    return Number(b.preferred) - Number(a.preferred);
  });

  const jumpToDate = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    const newDate = new Date(y, m - 1, d);
    setSelectedDate(newDate);
    setViewMonth(new Date(y, m - 1, 1));
  };

  const goToday = () => {
    setSelectedDate(today);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const shiftWeek = (delta: number) => setSelectedDate((d) => addDays(d, delta * 7));

  return (
    <div>
      <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: C.navy }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.gold, fontFamily: "Barlow, sans-serif" }}>
              Real-time snapshot
            </p>
            <p className="text-white text-2xl font-bold mt-1" style={{ fontFamily: "Barlow, sans-serif" }}>
              {availableCount} of {filtered.length} subs available
            </p>
            <p className="text-sm mt-0.5" style={{ color: "#C7CEDE" }}>
              {isToday ? "Today, " : ""}
              {prettyDate(selectedDate)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg p-1 bg-white">
              <button
                onClick={() => setViewMode("week")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
                style={{ fontFamily: "Barlow, sans-serif", backgroundColor: viewMode === "week" ? C.navy : "transparent", color: viewMode === "week" ? "white" : C.grey }}
              >
                <CalendarRange size={13} /> Week
              </button>
              <button
                onClick={() => setViewMode("month")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
                style={{ fontFamily: "Barlow, sans-serif", backgroundColor: viewMode === "month" ? C.navy : "transparent", color: viewMode === "month" ? "white" : C.grey }}
              >
                <Grid3x3 size={13} /> Month
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
                style={{ fontFamily: "Barlow, sans-serif", backgroundColor: viewMode === "list" ? C.navy : "transparent", color: viewMode === "list" ? "white" : C.grey }}
              >
                <ClipboardList size={13} /> List
              </button>
            </div>

            <label className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
              <CalendarDays size={14} />
              <input
                type="date"
                value={toInputValue(selectedDate)}
                onChange={(e) => jumpToDate(e.target.value)}
                className="outline-none text-xs"
                style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}
              />
            </label>

            <button
              onClick={goToday}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white"
              style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 mb-6" style={{ borderColor: "#E3E5EA" }}>
        {viewMode === "week" ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                Week of {startOfWeek(selectedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => shiftWeek(-1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronLeft size={16} color={C.navy} /></button>
                <button onClick={() => shiftWeek(1)} className="p-1.5 rounded hover:bg-gray-100"><ChevronRight size={16} color={C.navy} /></button>
              </div>
            </div>
            <WeekStrip subs={filtered} selectedDate={selectedDate} setSelectedDate={setSelectedDate} bookedDates={bookedDates} />
          </>
        ) : viewMode === "month" ? (
          <MonthGrid subs={filtered} viewMonth={viewMonth} setViewMonth={setViewMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} bookedDates={bookedDates} />
        ) : (
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
              Your current bookings
            </p>
            <TeacherSchedule
              teacherId={teacherId}
              requests={requests}
              subs={subs}
              onCancel={onCancelBooking}
              onOpenBooking={onOpenBooking}
            />
          </div>
        )}
        {(viewMode === "week" || viewMode === "month") && bookedDates.size > 0 && (
          <p className="flex items-center gap-1.5 text-xs mt-3" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            <span className="rounded" style={{ width: 12, height: 12, backgroundColor: "#E8EEF8", border: `1.5px solid ${C.blue}`, display: "inline-block" }} />
            Highlighted dates are ones you already have a booking on
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.grey} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search substitutes by name..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: "#D9DCE3", fontFamily: "PT Serif, serif" }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SubjectChip label="All subjects" active={subjectFilter === "All"} onClick={() => setSubjectFilter("All")} tone={C.navy} />
          {SUBJECTS.map((s) => (
            <SubjectChip key={s} label={s} active={subjectFilter === s} onClick={() => setSubjectFilter(s)} tone={C.navy} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <SubjectChip label="All divisions" active={divisionFilter === "All"} onClick={() => setDivisionFilter("All")} tone={C.blue} />
          {DIVISIONS.map((d) => (
            <SubjectChip key={d} label={d} active={divisionFilter === d} onClick={() => setDivisionFilter(d)} tone={C.blue} />
          ))}
        </div>
        <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          Showing availability for {prettyDate(selectedDate)}. Click a substitute to see their full calendar and contact info.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((sub) => {
          const status = effectiveStatus(sub.availability[dk]);
          const pendingCount = requests.filter((r) => r.subId === sub.id && r.status === "pending").length;
          return (
            <div
              key={sub.id}
              onClick={() => setOpenSubId(sub.id)}
              className="rounded-xl border bg-white p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
              style={{ borderColor: "#E3E5EA" }}
            >
              <div className="flex items-start gap-3">
                <Avatar sub={sub} showBadge badgeStatus={status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold truncate" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>
                      {sub.name}
                    </p>
                    {sub.preferred && <Star size={14} color={C.gold} fill={C.gold} />}
                  </div>
                  <StatusPill status={status} />
                </div>
                {pendingCount > 0 && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: "#FBF2DF", color: C.gold, fontFamily: "Barlow, sans-serif" }}
                  >
                    Pending
                  </span>
                )}
              </div>

              {sub.additionalInfo && (
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color: C.grey,
                    fontFamily: "PT Serif, serif",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {sub.additionalInfo}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5">
                {(sub.division || []).map((d) => (
                  <span key={d} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: C.blue, color: C.blue, fontFamily: "Barlow, sans-serif" }}>
                    {d}
                  </span>
                ))}
                {sub.subjects.map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.greyLight, color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs" style={{ color: C.grey }}>
                <span className="flex items-center gap-1"><Phone size={12} /> {sub.phone}</span>
              </div>
            </div>
          );
        })}
      </div>

      <SubDetailModal
        key={openSubId ?? "none"}
        sub={subs.find((s) => s.id === openSubId)}
        requests={requests}
        initialDate={selectedDate}
        onClose={() => setOpenSubId(null)}
        onRequestSend={sendRequest}
        onMultiRequestSend={sendMultiRequest}
      />
    </div>
  );
}
