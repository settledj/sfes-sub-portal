import type { PrismaClient } from "@prisma/client";

interface NotificationInput {
  event: string;
  toName: string;
  toEmail?: string | null;
  toPhone?: string | null;
  subject: string;
  body: string;
}

// Always writes the audit-trail row (Admin > Notifications tab), and — when the
// relevant API keys are present — also actually sends the email/SMS. Without keys
// this behaves exactly like the prototype's simulated log. Per Section 6 of the
// handoff doc, the log stays even once real sending is wired up.
export async function logNotification(prisma: PrismaClient, entry: NotificationInput) {
  const record = await prisma.notification.create({ data: entry });

  await Promise.all([sendEmail(entry), sendSms(entry)]).catch((e) => {
    // Real delivery failing shouldn't break the underlying booking action —
    // the audit-trail row above already recorded what should have gone out.
    console.error("Notification delivery failed:", e);
  });

  return record;
}

async function sendEmail(entry: NotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !entry.toEmail) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "St. Francis Sub Portal <onboarding@resend.dev>",
    to: entry.toEmail,
    subject: entry.subject,
    text: entry.body,
  });
}

async function sendSms(entry: NotificationInput) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from || !entry.toPhone) return;

  const twilio = (await import("twilio")).default;
  const client = twilio(sid, token);
  await client.messages.create({ to: entry.toPhone, from, body: `${entry.subject}: ${entry.body}` });
}
