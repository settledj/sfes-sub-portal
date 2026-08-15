"use client";

import { useState } from "react";
import { User, ClipboardList, Search, Star } from "lucide-react";
import { C } from "@/lib/constants";
import { Avatar } from "@/components/shared/Avatar";
import { AdminTeacherModal } from "@/components/admin/AdminTeacherModal";
import { AdminSubModal } from "@/components/admin/AdminSubModal";
import type { Sub, Teacher, Booking } from "@/lib/types";

export function AdminPeople({
  subs,
  teachers,
  requests,
  onCancel,
  onQuickBookSub,
  onOpenBooking,
}: {
  subs: Sub[];
  teachers: Teacher[];
  requests: Booking[];
  onCancel: (id: string) => void;
  onQuickBookSub: (sub: Sub) => void;
  onOpenBooking: (id: string) => void;
}) {
  const [mode, setMode] = useState<"teachers" | "subs">("teachers");
  const [query, setQuery] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);

  const filteredTeachers = teachers.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));
  const filteredSubs = subs.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const countsFor = (personId: number, key: "teacherId" | "subId") => ({
    pending: requests.filter((r) => r[key] === personId && r.status === "pending").length,
    confirmed: requests.filter((r) => r[key] === personId && r.status === "accepted").length,
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center rounded-lg p-1 bg-white border" style={{ borderColor: "#E3E5EA" }}>
          <button
            onClick={() => { setMode("teachers"); setQuery(""); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-semibold"
            style={{ fontFamily: "Barlow, sans-serif", backgroundColor: mode === "teachers" ? C.navy : "transparent", color: mode === "teachers" ? "white" : C.grey }}
          >
            <User size={14} /> Teachers
          </button>
          <button
            onClick={() => { setMode("subs"); setQuery(""); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-semibold"
            style={{ fontFamily: "Barlow, sans-serif", backgroundColor: mode === "subs" ? C.navy : "transparent", color: mode === "subs" ? "white" : C.grey }}
          >
            <ClipboardList size={14} /> Substitutes
          </button>
        </div>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.grey} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "teachers" ? "Search teachers by name..." : "Search substitutes by name..."}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: "#D9DCE3", fontFamily: "PT Serif, serif" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mode === "teachers"
          ? filteredTeachers.map((t) => {
              const counts = countsFor(t.id, "teacherId");
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeacherId(t.id)}
                  className="rounded-xl border bg-white p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
                  style={{ borderColor: "#E3E5EA" }}
                >
                  <Avatar sub={t} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{t.name}</p>
                    <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>{t.subject}</p>
                    {(counts.pending > 0 || counts.confirmed > 0) && (
                      <div className="flex gap-1 mt-1">
                        {counts.confirmed > 0 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>{counts.confirmed} confirmed</span>
                        )}
                        {counts.pending > 0 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#FBF2DF", color: C.gold, fontFamily: "Barlow, sans-serif" }}>{counts.pending} pending</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          : filteredSubs.map((s) => {
              const counts = countsFor(s.id, "subId");
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubId(s.id)}
                  className="rounded-xl border bg-white p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
                  style={{ borderColor: "#E3E5EA" }}
                >
                  <Avatar sub={s} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold truncate" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{s.name}</p>
                      {s.preferred && <Star size={12} color={C.gold} fill={C.gold} />}
                      {!s.hrApproved && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: "#FDEBEC", color: C.red, fontFamily: "Barlow, sans-serif" }}>
                          Not HR approved
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                      {(s.division || []).join(", ") || "No division listed"}
                      {s.needsApproval ? " · needs approval" : ""}
                    </p>
                    {(counts.pending > 0 || counts.confirmed > 0) && (
                      <div className="flex gap-1 mt-1">
                        {counts.confirmed > 0 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>{counts.confirmed} confirmed</span>
                        )}
                        {counts.pending > 0 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#FBF2DF", color: C.gold, fontFamily: "Barlow, sans-serif" }}>{counts.pending} pending</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
      </div>

      {selectedTeacherId && (
        <AdminTeacherModal
          teacher={filteredTeachers.find((t) => t.id === selectedTeacherId) || teachers.find((t) => t.id === selectedTeacherId)!}
          requests={requests}
          subs={subs}
          onClose={() => setSelectedTeacherId(null)}
          onCancel={onCancel}
          onOpenBooking={onOpenBooking}
        />
      )}
      {selectedSubId && (
        <AdminSubModal
          sub={subs.find((s) => s.id === selectedSubId)!}
          requests={requests}
          onClose={() => setSelectedSubId(null)}
          onQuickBook={(sub) => {
            setSelectedSubId(null);
            onQuickBookSub(sub);
          }}
          onOpenBooking={onOpenBooking}
        />
      )}
    </div>
  );
}
