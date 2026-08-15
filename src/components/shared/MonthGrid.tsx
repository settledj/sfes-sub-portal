import { ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "@/lib/constants";
import { dateKey, isSameDay } from "@/lib/dates";
import { effectiveStatus, isRequestable } from "@/lib/availability";
import type { Sub } from "@/lib/types";

export function MonthGrid({
  subs,
  viewMonth,
  setViewMonth,
  selectedDate,
  setSelectedDate,
  bookedDates,
  showBookedCount = false,
  onDayActivate,
}: {
  subs: Sub[];
  viewMonth: Date;
  setViewMonth: (d: Date) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  bookedDates?: Set<string>;
  showBookedCount?: boolean;
  onDayActivate?: (d: Date) => void;
}) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>
          {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded hover:bg-gray-100">
            <ChevronLeft size={16} color={C.navy} />
          </button>
          <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded hover:bg-gray-100">
            <ChevronRight size={16} color={C.navy} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const d = new Date(year, month, day);
          const dk = dateKey(d);
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const availableCount = subs.filter((s) => isRequestable(s.availability[dk])).length;
          const dayBookedCount = subs.filter((s) => effectiveStatus(s.availability[dk]) === "booked").length;
          const isSelected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, new Date());
          const isBooked = bookedDates?.has(dk);
          return (
            <button
              key={idx}
              onClick={() => {
                if (isWeekend) return;
                setSelectedDate(d);
                onDayActivate?.(d);
              }}
              disabled={isWeekend}
              className="relative rounded-lg py-1.5 flex flex-col items-center gap-0.5 border-2 transition-all"
              style={{
                backgroundColor: isSelected ? C.navy : isBooked ? "#E8EEF8" : isWeekend ? "#F2F3F5" : "white",
                borderColor: isSelected ? (isBooked ? C.blue : C.navy) : isBooked ? C.blue : isToday ? C.gold : "#E3E5EA",
                cursor: isWeekend ? "default" : "pointer",
              }}
            >
              {showBookedCount && dayBookedCount > 0 && !isWeekend && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white border-2 border-white"
                  style={{ width: 15, height: 15, backgroundColor: C.gold, fontFamily: "Barlow, sans-serif" }}
                  title={`${dayBookedCount} booked`}
                >
                  {dayBookedCount}
                </span>
              )}
              <span
                className="text-xs font-semibold"
                style={{ color: isSelected ? "white" : isBooked ? C.blue : isWeekend ? "#B7BAC2" : C.navy, fontFamily: "Barlow, sans-serif" }}
              >
                {day}
              </span>
              {!isWeekend && (
                <span
                  className="text-[9px] font-bold"
                  style={{
                    color: isSelected ? "#C7CEDE" : isBooked ? C.blue : availableCount > 0 ? C.teal : C.grey,
                    fontFamily: "Barlow, sans-serif",
                  }}
                >
                  {isBooked ? "Booked" : availableCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
