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
import { AdminSubModal } from "@/components/admin/AdminSubModal";
import type { Sub, Booking } from "@/lib/types";

export function AdminAvailability({
  subs,
  requests,
  onQuickBookSub,
}: {
  subs: Sub[];
  requests: Booking[];
  onQuickBookSub: (sub: Sub) => void;
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

      {viewMode !== "list" && (
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
              <WeekStrip subs={filtered} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </>
          ) : (
            <MonthGrid subs={filtered} viewMonth={viewMonth} setViewMonth={setViewMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          )}
        </div>
      )}

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
          Showing availability for {prettyDate(selectedDate)}. Click a substitute to see their full calendar and book them.
        </p>
      </div>

      {viewMode === "list" ? (
        <div className="flex flex-col gap-2">
          {sorted.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: C.greyLight }}>
              <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>No substitutes match this search.</p>
            </div>
          ) : (
            sorted.map((sub) => {
              const status = effectiveStatus(sub.availability[dk]);
              const pendingCount = requests.filter((r) => r.subId === sub.id && r.status === "pending").length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setOpenSubId(sub.id)}
                  className="w-full text-left rounded-xl border bg-white p-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
                  style={{ borderColor: "#E3E5EA" }}
                >
                  <Avatar sub={sub} showBadge badgeStatus={status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold truncate" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>{sub.name}</p>
                      {sub.preferred && <Star size={12} color={C.gold} fill={C.gold} />}
                    </div>
                    <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                      {(sub.division || []).join(", ") || "No division listed"}
                    </p>
                  </div>
                  <span className="text-xs hidden sm:flex items-center gap-1 shrink-0" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                    <Phone size={12} /> {sub.phone}
                  </span>
                  {pendingCount > 0 && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                      style={{ backgroundColor: "#FBF2DF", color: C.gold, fontFamily: "Barlow, sans-serif" }}
                    >
                      Pending
                    </span>
                  )}
                  <span className="shrink-0"><StatusPill status={status} /></span>
                </button>
              );
            })
          )}
        </div>
      ) : (
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
      )}

      {openSubId && (
        <AdminSubModal
          sub={subs.find((s) => s.id === openSubId)!}
          requests={requests}
          onClose={() => setOpenSubId(null)}
          onQuickBook={(sub) => {
            setOpenSubId(null);
            onQuickBookSub(sub);
          }}
        />
      )}
    </div>
  );
}
