import { C } from "@/lib/constants";
import { addDays, dateKey, isSameDay, startOfWeek } from "@/lib/dates";
import { isRequestable } from "@/lib/availability";
import type { Sub } from "@/lib/types";

export function WeekStrip({
  subs,
  selectedDate,
  setSelectedDate,
  bookedDates,
}: {
  subs: Sub[];
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  bookedDates?: Set<string>;
}) {
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const dk = dateKey(d);
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const availableCount = subs.filter((s) => isRequestable(s.availability[dk])).length;
        const isSelected = isSameDay(d, selectedDate);
        const isToday = isSameDay(d, new Date());
        const isBooked = bookedDates?.has(dk);
        return (
          <button
            key={i}
            onClick={() => setSelectedDate(d)}
            className="relative rounded-lg p-2.5 flex flex-col items-center gap-1 border-2 transition-all"
            style={{
              backgroundColor: isSelected ? C.navy : isBooked ? "#E8EEF8" : "white",
              borderColor: isSelected ? (isBooked ? C.blue : C.navy) : isBooked ? C.blue : isToday ? C.gold : "#E3E5EA",
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase"
              style={{ color: isSelected ? "#C7CEDE" : isBooked ? C.blue : C.grey, fontFamily: "Barlow, sans-serif" }}
            >
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span
              className="text-base font-bold"
              style={{ color: isSelected ? "white" : isBooked ? C.blue : C.navy, fontFamily: "Barlow, sans-serif" }}
            >
              {d.getDate()}
            </span>
            {isWeekend ? (
              <span className="text-[10px]" style={{ color: isSelected ? "#8C97B5" : "#B7BAC2" }}>—</span>
            ) : isBooked ? (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.15)" : "white", color: isSelected ? "white" : C.blue, fontFamily: "Barlow, sans-serif" }}
              >
                Booked
              </span>
            ) : (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isSelected ? "rgba(255,255,255,0.15)" : availableCount > 0 ? "#E4F2EF" : C.greyLight,
                  color: isSelected ? "white" : availableCount > 0 ? C.teal : C.grey,
                  fontFamily: "Barlow, sans-serif",
                }}
              >
                {availableCount} free
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
