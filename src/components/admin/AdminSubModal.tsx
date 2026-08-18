"use client";

import { useState } from "react";
import { X, Star, PlusCircle } from "lucide-react";
import { C, bookingBadgeMeta } from "@/lib/constants";
import { dateKey, dkToDate, prettyDate } from "@/lib/dates";
import { usernameFor } from "@/lib/people";
import { Avatar } from "@/components/shared/Avatar";
import { MiniCalendar } from "@/components/shared/MiniCalendar";
import { PhoneActions } from "@/components/shared/PhoneActions";
import type { Sub, Booking } from "@/lib/types";

export function AdminSubModal({
  sub,
  requests,
  onClose,
  onQuickBook,
  onOpenBooking,
}: {
  sub: Sub;
  requests: Booking[];
  onClose: () => void;
  onQuickBook: (sub: Sub) => void;
  onOpenBooking: (id: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [pickedDate, setPickedDate] = useState(new Date());

  const mine = requests.filter((r) => r.subId === sub.id && r.status !== "cancelled").sort((a, b) => (a.dk > b.dk ? 1 : -1));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <Avatar sub={sub} size={56} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-lg truncate" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>{sub.name}</p>
                {sub.preferred && <Star size={14} color={C.gold} fill={C.gold} />}
              </div>
              <p className="text-xs flex items-center gap-1.5" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                <PhoneActions phone={sub.phone} size={11} /><span>· {sub.email}</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.blue, fontFamily: "Barlow, sans-serif" }}>Login: {usernameFor(sub.name)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {sub.hrApproved && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>
                HR approved
              </span>
            )}
            {sub.needsApproval && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FBF2DF", color: C.gold, fontFamily: "Barlow, sans-serif" }}>
                Needs division head approval
              </span>
            )}
            {(sub.division || []).map((d) => (
              <span key={d} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: C.blue, color: C.blue, fontFamily: "Barlow, sans-serif" }}>{d}</span>
            ))}
            {sub.subjects.map((s) => (
              <span key={s} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: C.greyLight, color: C.navy, fontFamily: "Barlow, sans-serif" }}>{s}</span>
            ))}
          </div>

          {sub.additionalInfo && (
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>
              {sub.additionalInfo}
            </p>
          )}

          <p className="text-xs font-semibold uppercase tracking-widest mt-5 mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>Availability</p>
          <MiniCalendar
            sub={sub}
            viewMonth={viewMonth}
            setViewMonth={setViewMonth}
            isSelected={(dk) => dateKey(pickedDate) === dk}
            onSelect={setPickedDate}
          />

          <div className="flex items-center justify-between mt-5 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>Bookings</p>
            <button
              onClick={() => onQuickBook(sub)}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}
            >
              <PlusCircle size={13} /> Manually book
            </button>
          </div>
          {mine.length === 0 ? (
            <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>No bookings on record.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {mine.map((r) => {
                const meta = bookingBadgeMeta(r);
                return (
                  <button
                    key={r.id}
                    onClick={() => onOpenBooking(r.id)}
                    className="w-full text-left flex items-center justify-between rounded-lg px-3 py-2 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: C.greyLight }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{prettyDate(dkToDate(r.dk))}</p>
                      <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                        {r.teacherName || "Unknown teacher"}{(r.subject || r.grade) && ` · ${[r.subject, r.grade].filter(Boolean).join(" · ")}`}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "Barlow, sans-serif" }}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
