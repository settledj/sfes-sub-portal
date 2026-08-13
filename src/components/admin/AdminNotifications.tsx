import { Bell, Mail, MessageSquare } from "lucide-react";
import { C } from "@/lib/constants";
import type { Notification } from "@/lib/types";

export function AdminNotifications({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center" style={{ borderColor: "#E3E5EA" }}>
        <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          No notifications yet. They&apos;ll appear here as requests are sent and answered.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg px-3 py-2.5 mb-4 flex items-start gap-2" style={{ backgroundColor: "#FBF2DF" }}>
        <Bell size={15} color={C.gold} className="mt-0.5 shrink-0" />
        <p className="text-xs" style={{ color: "#7A6220", fontFamily: "PT Serif, serif" }}>
          This is a simulated log for the prototype — it shows exactly what would be emailed and texted, but nothing
          actually leaves this browser. Wiring real delivery needs an email/SMS provider (e.g. SendGrid, Twilio) on
          the backend once this becomes a real app.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <div key={n.id} className="rounded-xl border bg-white p-4" style={{ borderColor: "#E3E5EA" }}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{n.subject}</p>
              <p className="text-[11px] whitespace-nowrap" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
                {new Date(n.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
            <p className="text-sm mb-2" style={{ color: "#3F4552", fontFamily: "PT Serif, serif" }}>{n.body}</p>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
              <span className="flex items-center gap-1"><Mail size={12} /> {n.toName}{n.toEmail ? ` · ${n.toEmail}` : " · no email on file"}</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> {n.toPhone || "no phone on file"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
