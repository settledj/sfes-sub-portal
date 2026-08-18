"use client";

import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Grid3x3, ClipboardList } from "lucide-react";
import { C } from "@/lib/constants";
import { prettyDate, startOfWeek, toInputValue } from "@/lib/dates";
import { WeekStrip } from "@/components/shared/WeekStrip";
import { MonthGrid } from "@/components/shared/MonthGrid";
import { AdminBookings } from "@/components/admin/AdminBookings";
import type { Sub, Teacher, Booking } from "@/lib/types";

export type AdminViewMode = "week" | "month" | "list";

// The banner + Week/Month/List toggle + the calendar widget (or, in List
// mode, the full bookings manager).
export function AdminAvailability({
  subs,
  teachers,
  requests,
  closures,
  availableCount,
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  viewMonth,
  setViewMonth,
  isToday,
  jumpToDate,
  goToday,
  shiftWeek,
  onDayActivate,
  onApprove,
  onDecline,
  onCancel,
  onReschedule,
  onRebook,
  onOpenBooking,
}: {
  subs: Sub[];
  teachers: Teacher[];
  requests: Booking[];
  closures: Map<string, string>;
  availableCount: number;
  viewMode: AdminViewMode;
  setViewMode: (m: AdminViewMode) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  viewMonth: Date;
  setViewMonth: (d: Date) => void;
  isToday: boolean;
  jumpToDate: (value: string) => void;
  goToday: () => void;
  shiftWeek: (delta: number) => void;
  onDayActivate: (d: Date) => void;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string, update: { subId: number; dk: string }) => void;
  onRebook: (r: Booking) => void;
  onOpenBooking: (id: string) => void;
}) {
  return (
    <div>
      <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: C.navy }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.gold, fontFamily: "Barlow, sans-serif" }}>
              Real-time snapshot
            </p>
            <p className="text-white text-2xl font-bold mt-1" style={{ fontFamily: "Barlow, sans-serif" }}>
              {availableCount} of {subs.length} subs available
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

      {viewMode === "list" ? (
        <AdminBookings
          requests={requests}
          subs={subs}
          teachers={teachers}
          onApprove={onApprove}
          onDecline={onDecline}
          onCancel={onCancel}
          onReschedule={onReschedule}
          onRebook={onRebook}
          onOpenBooking={onOpenBooking}
        />
      ) : (
        <div className="rounded-xl border bg-white p-4" style={{ borderColor: "#E3E5EA" }}>
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
              <WeekStrip
                subs={subs}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                closures={closures}
                showBookedCount
                onDayActivate={onDayActivate}
              />
            </>
          ) : (
            <MonthGrid
              subs={subs}
              viewMonth={viewMonth}
              setViewMonth={setViewMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              closures={closures}
              showBookedCount
              onDayActivate={onDayActivate}
            />
          )}
          <p className="text-xs mt-3" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            Click a day to see everything scheduled on it.
          </p>
        </div>
      )}
    </div>
  );
}
