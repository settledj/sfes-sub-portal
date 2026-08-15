"use client";

import { useState } from "react";
import { Search, Star, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { C, SUBJECTS, DIVISIONS } from "@/lib/constants";
import { prettyDate } from "@/lib/dates";
import { effectiveStatus } from "@/lib/availability";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill } from "@/components/shared/StatusPill";
import { SubjectChip } from "@/components/shared/SubjectChip";
import { AdminSubModal } from "@/components/admin/AdminSubModal";
import type { Sub, Booking } from "@/lib/types";

const PAGE_SIZE = 5;

// Search + subject/division filters + the substitute card grid. Deliberately
// the last section on the page (see AdminPortal) so whichever tab an admin
// picked renders right under the snapshot instead of below this directory.
// `subs` arrives already filtered by query/subjectFilter/divisionFilter —
// AdminPortal computes that once and shares it with the snapshot's calendar
// widget too, so the two stay in sync without filtering twice.
export function AdminSubstituteDirectory({
  subs,
  requests,
  dk,
  selectedDate,
  query,
  setQuery,
  subjectFilter,
  setSubjectFilter,
  divisionFilter,
  setDivisionFilter,
  onQuickBookSub,
}: {
  subs: Sub[];
  requests: Booking[];
  dk: string;
  selectedDate: Date;
  query: string;
  setQuery: (v: string) => void;
  subjectFilter: string;
  setSubjectFilter: (v: string) => void;
  divisionFilter: string;
  setDivisionFilter: (v: string) => void;
  onQuickBookSub: (sub: Sub) => void;
}) {
  const [openSubId, setOpenSubId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const sorted = [...subs].sort((a, b) => {
    const rank = (s: Sub) => {
      const st = effectiveStatus(s.availability[dk]);
      return st === "available" ? 0 : st === "booked" ? 1 : 2;
    };
    const byAvail = rank(a) - rank(b);
    if (byAvail !== 0) return byAvail;
    return Number(b.preferred) - Number(a.preferred);
  });

  const visible = showAll ? sorted : sorted.slice(0, PAGE_SIZE);
  const remaining = sorted.length - visible.length;

  return (
    <div>
      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.grey} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowAll(false);
            }}
            placeholder="Search substitutes by name..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: "#D9DCE3", fontFamily: "PT Serif, serif" }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SubjectChip label="All subjects" active={subjectFilter === "All"} onClick={() => { setSubjectFilter("All"); setShowAll(false); }} tone={C.navy} />
          {SUBJECTS.map((s) => (
            <SubjectChip key={s} label={s} active={subjectFilter === s} onClick={() => { setSubjectFilter(s); setShowAll(false); }} tone={C.navy} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <SubjectChip label="All divisions" active={divisionFilter === "All"} onClick={() => { setDivisionFilter("All"); setShowAll(false); }} tone={C.blue} />
          {DIVISIONS.map((d) => (
            <SubjectChip key={d} label={d} active={divisionFilter === d} onClick={() => { setDivisionFilter(d); setShowAll(false); }} tone={C.blue} />
          ))}
        </div>
        <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          Showing availability for {prettyDate(selectedDate)}. Click a substitute to see their full calendar and book them.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: C.greyLight }}>
          <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>No substitutes match this search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((sub) => {
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

          {sorted.length > PAGE_SIZE && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold mt-4 mx-auto"
              style={{ color: C.blue, fontFamily: "Barlow, sans-serif" }}
            >
              {showAll ? (
                <>Show less <ChevronUp size={15} /></>
              ) : (
                <>Show {remaining} more <ChevronDown size={15} /></>
              )}
            </button>
          )}
        </>
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
