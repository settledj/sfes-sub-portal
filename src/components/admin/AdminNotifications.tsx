import { Bell, Mail, MessageSquare, Check, X, Minus } from "lucide-react";
import { C } from "@/lib/constants";
import type { Notification, DeliveryStatus } from "@/lib/types";

const STATUS_STYLE: Record<DeliveryStatus, { icon: typeof Check; color: string; label: string }> = {
  sent: { icon: Check, color: "#2F6B4F", label: "Sent" },
  failed: { icon: X, color: "#B23A3A", label: "Failed" },
  skipped: { icon: Minus, color: C.grey, label: "Not configured" },
};

function DeliveryBadge({
  channel,
  status,
  error,
  detail,
}: {
  channel: "email" | "sms";
  status: DeliveryStatus;
  error: string | null;
  detail: string;
}) {
  const { icon: Icon, color, label } = STATUS_STYLE[status];
  const ChannelIcon = channel === "email" ? Mail : MessageSquare;
  return (
    <span className="flex items-center gap-1" title={error || undefined}>
      <ChannelIcon size={12} />
      {detail}
      <Icon size={12} color={color} className="ml-0.5" />
      <span style={{ color }}>{label}{error ? ` — ${error}` : ""}</span>
    </span>
  );
}

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
          This log records every notification the app tries to send, plus whether the real email/text actually went
          out. &quot;Not configured&quot; means no provider key or no address/phone on file; &quot;Failed&quot; means
          the provider rejected it (hover the row for the error).
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
              <DeliveryBadge
                channel="email"
                status={n.emailStatus}
                error={n.emailError}
                detail={`${n.toName}${n.toEmail ? ` · ${n.toEmail}` : " · no email on file"}`}
              />
              <DeliveryBadge channel="sms" status={n.smsStatus} error={n.smsError} detail={n.toPhone || "no phone on file"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
