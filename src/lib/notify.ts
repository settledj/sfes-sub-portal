import type { PrismaClient } from "@prisma/client";

interface NotificationInput {
  event: string;
  toName: string;
  toEmail?: string | null;
  toPhone?: string | null;
  subject: string;
  body: string;
  // Optional HTML version (calendar links, accept/decline buttons, etc.) —
  // sent alongside the plain-text body for clients that render it.
  html?: string;
  // The recipient's own preference for this notification category (see
  // notifyBookingUpdates/notifyMessages on Teacher/Substitute) — defaults to
  // true when omitted. When false, still logs the audit-trail row but skips
  // the actual send, same as a missing API key or recipient address.
  enabled?: boolean;
}

type DeliveryResult = { status: "sent" | "failed" | "skipped"; error: string | null };

// Always writes the audit-trail row (Admin > Notifications tab), and — when the
// relevant API keys are present — also actually sends the email/SMS. Without keys
// this behaves exactly like the prototype's simulated log. Per Section 6 of the
// handoff doc, the log stays even once real sending is wired up. Delivery outcome
// (sent/failed/skipped, plus any provider error) is stored on the row itself so a
// failed real send is visible in the admin UI instead of looking identical to a
// successful one — see emailStatus/smsStatus on the Notification model.
export async function logNotification(prisma: PrismaClient, entry: NotificationInput) {
  const [email, sms] = await Promise.all([sendEmail(entry), sendSms(entry)]);

  // html isn't a column on Notification — only the fields below are logged.
  return prisma.notification.create({
    data: {
      event: entry.event,
      toName: entry.toName,
      toEmail: entry.toEmail,
      toPhone: entry.toPhone,
      subject: entry.subject,
      body: entry.body,
      emailStatus: email.status,
      emailError: email.error,
      smsStatus: sms.status,
      smsError: sms.error,
    },
  });
}

async function sendEmail(entry: NotificationInput): Promise<DeliveryResult> {
  if (entry.enabled === false) return { status: "skipped", error: "Recipient has disabled this notification type." };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !entry.toEmail) return { status: "skipped", error: null };

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    // The Resend SDK resolves with { data, error } on API-level rejections (e.g.
    // sandbox sender restrictions) rather than throwing — has to be checked explicitly.
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "St. Francis Sub Portal <onboarding@resend.dev>",
      to: entry.toEmail,
      subject: entry.subject,
      text: entry.body,
      ...(entry.html ? { html: entry.html } : {}),
    });
    if (error) {
      console.error("Email delivery failed:", error);
      return { status: "failed", error: error.message };
    }
    return { status: "sent", error: null };
  } catch (e) {
    console.error("Email delivery failed:", e);
    return { status: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}

async function sendSms(entry: NotificationInput): Promise<DeliveryResult> {
  if (entry.enabled === false) return { status: "skipped", error: "Recipient has disabled this notification type." };

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from || !entry.toPhone) return { status: "skipped", error: null };

  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(sid, token);
    await client.messages.create({ to: entry.toPhone, from, body: `${entry.subject}: ${entry.body}` });
    return { status: "sent", error: null };
  } catch (e) {
    console.error("SMS delivery failed:", e);
    return { status: "failed", error: e instanceof Error ? e.message : String(e) };
  }
}
