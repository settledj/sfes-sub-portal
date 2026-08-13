import { ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "@/lib/constants";
import { dateKey } from "@/lib/dates";
import { effectiveStatus } from "@/lib/availability";
import type { Sub } from "@/lib/types";

export function MiniCalendar({
  sub,
  viewMonth,
  setViewMonth,
  pickedDate,
  setPickedDate,
}: {
  sub: Sub;
  viewMonth: Date;
  setViewMonth: (d: Date) => void;
  pickedDate: Date;
  setPickedDate: (d: Date) => void;
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
          <button onClick={() => setViewMonth(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft size={16} color={C.navy} />
          </button>
          <button onClick={() => setViewMonth(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-gray-100">
            <ChevronRight size={16} color={C.navy} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const d = new Date(year, month, day);
          const dk = dateKey(d);
          const status = effectiveStatus(sub.availability[dk]);
          const isPicked = dateKey(pickedDate) === dk;
          const bg = status === "booked" ? C.gold : status === "unavailable" ? C.red : C.teal;
          return (
            <button
              key={idx}
              onClick={() => setPickedDate(d)}
              className="aspect-square rounded-md text-xs font-medium flex items-center justify-center border transition-all"
              style={{
                backgroundColor: bg,
                color: "white",
                borderColor: isPicked ? C.navy : bg,
                borderWidth: isPicked ? 2 : 1,
                fontFamily: "Barlow, sans-serif",
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px]" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.teal }} /> Available</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.red }} /> Unavailable</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: C.gold }} /> Booked</span>
      </div>
    </div>
  );
}
