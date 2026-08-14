"use client";

import { useState } from "react";
import { Search, Check, Ban, RefreshCw, XCircle, PlusCircle } from "lucide-react";
import { C } from "@/lib/constants";
import { dateKey, dkToDate, prettyDate, toInputValue } from "@/lib/dates";
import { Avatar } from "@/components/shared/Avatar";
import { ConfirmCancelBookingModal } from "@/components/shared/ConfirmCancelBookingModal";
import type { Sub, Booking } from "@/lib/types";

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: C.gold, bg: "#FBF2DF" },
  accepted: { label: "Confirmed", color: C.teal, bg: "#E4F2EF" },
  declined: { label: "Declined", color: C.grey, bg: C.greyLight },
  cancelled: { label: "Cancelled", color: C.grey, bg: C.greyLight },
};

export function AdminBookings({
  requests,
  subs,
  onApprove,
  onDecline,
  onCancel,
  onReschedule,
  onRebook,
}: {
  requests: Booking[];
  subs: Sub[];
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string, update: { subId: number; dk: string }) => void;
  onRebook: (r: Booking) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("active");
  const [query, setQuery] = useState("");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSubId, setRescheduleSubId] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const filtered = requests
    .filter((r) => {
      if (statusFilter === "active" && r.status === "cancelled") return false;
      if (statusFilter !== "active" && statusFilter !== "all" && r.status !== statusFilter) return false;
      const sub = subs.find((s) => s.id === r.subId);
      const text = `${r.teacherName || ""} ${sub?.name || ""}`.toLowerCase();
      return text.includes(query.toLowerCase());
    })
    .sort((a, b) => (a.dk > b.dk ? 1 : -1));

  const startReschedule = (r: Booking) => {
    setReschedulingId(r.id);
    setRescheduleDate(toInputValue(dkToDate(r.dk)));
    setRescheduleSubId(r.subId);
  };

  const submitReschedule = () => {
    if (!rescheduleDate || !reschedulingId || rescheduleSubId === null) return;
    const [y, m, d] = rescheduleDate.split("-").map(Number);
    const newDk = dateKey(new Date(y, m - 1, d));
    onReschedule(reschedulingId, { subId: rescheduleSubId, dk: newDk });
    setReschedulingId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.grey} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by teacher or substitute..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: "#D9DCE3", fontFamily: "PT Serif, serif" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm px-3 py-2.5 rounded-lg border outline-none"
          style={{ borderColor: "#D9DCE3", color: C.navy, fontFamily: "Barlow, sans-serif" }}
        >
          <option value="active">Active (hide cancelled)</option>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Confirmed</option>
          <option value="declined">Declined</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center" style={{ borderColor: "#E3E5EA" }}>
          <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>No bookings match this view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => {
            const sub = subs.find((s) => s.id === r.subId);
            const date = dkToDate(r.dk);
            const meta = statusMeta[r.status] || statusMeta.pending;
            const isRescheduling = reschedulingId === r.id;
            return (
              <div key={r.id} className="rounded-xl border bg-white p-4" style={{ borderColor: "#E3E5EA" }}>
                <div className="flex items-center gap-3">
                  {sub && <Avatar sub={sub} size={40} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                      {prettyDate(date)}
                    </p>
                    <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                      {r.teacherName || "Unknown teacher"} → {sub ? sub.name : "Unknown substitute"}
                      {(r.subject || r.grade) && ` · ${[r.subject, r.grade].filter(Boolean).join(" · ")}`}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "Barlow, sans-serif" }}>
                    {meta.label}
                  </span>
                </div>

                {r.notes && (
                  <p className="text-xs mt-2 sm:ml-[52px]" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>{r.notes}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3 sm:ml-[52px]">
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => onApprove(r.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md text-white"
                        style={{ backgroundColor: C.teal, fontFamily: "Barlow, sans-serif" }}
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => onDecline(r.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md"
                        style={{ backgroundColor: "white", color: C.grey, border: "1px solid #D9DCE3", fontFamily: "Barlow, sans-serif" }}
                      >
                        <Ban size={13} /> Decline
                      </button>
                    </>
                  )}
                  {r.status === "accepted" && (
                    <>
                      <button
                        onClick={() => startReschedule(r)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md"
                        style={{ color: C.blue, border: `1.5px solid ${C.blue}`, fontFamily: "Barlow, sans-serif" }}
                      >
                        <RefreshCw size={13} /> Reschedule
                      </button>
                      <button
                        onClick={() => setCancelingId(r.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md"
                        style={{ color: C.red, border: `1.5px solid ${C.red}`, fontFamily: "Barlow, sans-serif" }}
                      >
                        <XCircle size={13} /> Cancel booking
                      </button>
                    </>
                  )}
                  {(r.status === "declined" || r.status === "cancelled") && (
                    <button
                      onClick={() => onRebook(r)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md"
                      style={{ color: C.navy, border: "1.5px solid #D9DCE3", fontFamily: "Barlow, sans-serif" }}
                    >
                      <PlusCircle size={13} /> Rebook
                    </button>
                  )}
                </div>

                {isRescheduling && (
                  <div className="mt-3 sm:ml-[52px] p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-wrap" style={{ backgroundColor: C.greyLight }}>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>New date</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="text-sm px-2 py-1.5 rounded-md border outline-none"
                        style={{ borderColor: "#D9DCE3", fontFamily: "Barlow, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>Substitute</label>
                      <select
                        value={rescheduleSubId ?? undefined}
                        onChange={(e) => setRescheduleSubId(Number(e.target.value))}
                        className="text-sm px-2 py-1.5 rounded-md border outline-none"
                        style={{ borderColor: "#D9DCE3", fontFamily: "Barlow, sans-serif" }}
                      >
                        {subs.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={submitReschedule}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md text-white"
                        style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setReschedulingId(null)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md"
                        style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cancelingId && (
        <ConfirmCancelBookingModal
          booking={requests.find((r) => r.id === cancelingId)!}
          subName={subs.find((s) => s.id === requests.find((r) => r.id === cancelingId)!.subId)?.name || "Unknown substitute"}
          onClose={() => setCancelingId(null)}
          onConfirm={() => {
            onCancel(cancelingId);
            setCancelingId(null);
          }}
        />
      )}
    </div>
  );
}
