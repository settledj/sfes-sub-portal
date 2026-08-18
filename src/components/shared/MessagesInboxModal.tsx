"use client";

import { useEffect, useMemo, useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { C } from "@/lib/constants";
import { dkToDate, prettyDate } from "@/lib/dates";
import { fetchAllMessages } from "@/lib/api";
import { AvatarPair } from "@/components/shared/Avatar";
import type { Sub, Teacher, Booking, Message, PortalRole } from "@/lib/types";

interface Conversation {
  booking: Booking;
  latest: Message;
  sub?: Sub;
  teacher?: Teacher;
}

// One row per booking that has at least one message, showing the latest
// message preview — an inbox of conversations, not a flat feed of every
// message ever sent. Clicking a row hands off to the same BookingDetailModal
// used everywhere else a booking appears (see the "one centralized booking
// view" requirement this whole feature is built around).
export function MessagesInboxModal({
  requests,
  subs,
  teachers,
  role,
  myTeacherId,
  mySubId,
  onClose,
  onOpenBooking,
}: {
  requests: Booking[];
  subs: Sub[];
  teachers: Teacher[];
  role: PortalRole;
  myTeacherId?: number;
  mySubId?: number;
  onClose: () => void;
  onOpenBooking: (id: string) => void;
}) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAllMessages()
      .then((m) => !cancelled && setMessages(m))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const conversations = useMemo(() => {
    if (!messages) return [];
    const myRequestIds = new Set(
      requests
        .filter((r) => {
          if (role === "teacher") return r.teacherId === myTeacherId;
          if (role === "substitute") return r.subId === mySubId;
          return true; // admin sees every conversation
        })
        .map((r) => r.id)
    );

    const byRequest = new Map<string, Conversation>();
    for (const m of messages) {
      if (!myRequestIds.has(m.requestId) || byRequest.has(m.requestId)) continue;
      const booking = requests.find((r) => r.id === m.requestId);
      if (!booking) continue;
      byRequest.set(m.requestId, {
        booking,
        latest: m,
        sub: subs.find((s) => s.id === booking.subId),
        teacher: teachers.find((t) => t.id === booking.teacherId),
      });
    }
    // messages is already sorted desc by createdAt, so insertion order is already latest-first.
    return Array.from(byRequest.values());
  }, [messages, requests, subs, teachers, role, myTeacherId, mySubId]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <p className="text-lg font-bold mb-4 pr-6" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
            Messages
          </p>

          {error ? (
            <p className="text-sm text-center py-10" style={{ color: C.red, fontFamily: "PT Serif, serif" }}>
              Couldn&apos;t load messages.
            </p>
          ) : messages === null ? (
            <p className="text-sm text-center py-10" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
              Loading…
            </p>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <MessageCircle size={28} color={C.grey} />
              <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                No messages yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
              {conversations.map(({ booking, latest, sub, teacher }) => (
                <button
                  key={booking.id}
                  onClick={() => {
                    onOpenBooking(booking.id);
                    onClose();
                  }}
                  className="w-full text-left rounded-xl border p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
                  style={{ borderColor: "#E3E5EA" }}
                >
                  {sub && <AvatarPair primary={sub} secondary={role === "admin" ? teacher : undefined} size={40} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                        {role === "admin"
                          ? `${teacher?.name || booking.teacherName || "Unknown teacher"} → ${sub?.name || "Unknown substitute"}`
                          : role === "teacher"
                          ? sub?.name || "Unknown substitute"
                          : teacher?.name || booking.teacherName || "Unknown teacher"}
                      </p>
                      <span className="text-[11px] shrink-0" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                        {prettyDate(dkToDate(booking.dk))}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                      <span className="font-semibold">{latest.senderName}:</span> {latest.body}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
