"use client";

import { C } from "@/lib/constants";
import { Switch } from "@/components/shared/Switch";

export function NotificationPreferences({
  notifyBookingUpdates,
  notifyMessages,
  onChange,
}: {
  notifyBookingUpdates: boolean;
  notifyMessages: boolean;
  onChange: (updates: { notifyBookingUpdates?: boolean; notifyMessages?: boolean }) => void;
}) {
  return (
    <div className="rounded-xl border bg-white p-4" style={{ borderColor: "#E3E5EA" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
        Email notifications
      </p>
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
            Booking updates
          </p>
          <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            New requests, accepts/declines, cancellations
          </p>
        </div>
        <Switch checked={notifyBookingUpdates} onChange={(checked) => onChange({ notifyBookingUpdates: checked })} />
      </div>
      <div className="flex items-center justify-between gap-3 py-2 mt-1 border-t" style={{ borderColor: "#E3E5EA" }}>
        <div className="min-w-0">
          <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
            Messages
          </p>
          <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            New messages on a booking
          </p>
        </div>
        <Switch checked={notifyMessages} onChange={(checked) => onChange({ notifyMessages: checked })} />
      </div>
    </div>
  );
}
