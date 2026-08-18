import { Phone, MessageSquare } from "lucide-react";

// tel:/sms: only care about digits and a leading +; strip formatting so the
// link works regardless of how the number is displayed.
function dial(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

// Renders a phone number as a tap-to-call link, plus a small tap-to-text icon
// next to it — mobile browsers open the dialer/messages app directly. Calls
// stopPropagation since these are often nested inside an onClick card (e.g. a
// sub's card that opens their detail modal on click).
export function PhoneActions({ phone, size = 12 }: { phone: string; size?: number }) {
  if (!phone) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <a
        href={`tel:${dial(phone)}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 no-underline hover:underline"
        style={{ color: "inherit" }}
      >
        <Phone size={size} /> {phone}
      </a>
      <a
        href={`sms:${dial(phone)}`}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Text ${phone}`}
        title="Text"
        className="inline-flex items-center justify-center rounded hover:opacity-70"
        style={{ color: "inherit" }}
      >
        <MessageSquare size={size} />
      </a>
    </span>
  );
}
