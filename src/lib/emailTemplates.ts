// HTML (+ plain-text fallback) builders for every notification email. Inline
// styles throughout — email clients don't reliably support <style> blocks or
// external CSS, so this is the standard approach for transactional email.
import { C } from "./constants";
import type { CalendarLinks } from "./calendarLinks";

interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

function shell(heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:${C.cream};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:480px;">
<tr><td style="background-color:${C.navy};padding:20px 28px;font-family:Arial,Helvetica,sans-serif;">
<span style="color:#ffffff;font-weight:700;font-size:16px;">SubMe</span><br/>
<span style="color:#C7CEDE;font-size:12px;">St. Francis Episcopal School</span>
</td></tr>
<tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;color:#3F4552;font-size:15px;line-height:1.6;">
<h1 style="margin:0 0 16px;font-size:18px;color:${C.navy};">${heading}</h1>
${bodyHtml}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function solidButton(label: string, href: string, color: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:${color};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:600;font-size:14px;padding:12px 22px;border-radius:8px;margin:4px 10px 4px 0;">${label}</a>`;
}

function outlineButton(label: string, href: string, color: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:#ffffff;color:${color};border:1.5px solid ${color};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:600;font-size:14px;padding:10.5px 22px;border-radius:8px;margin:4px 10px 4px 0;">${label}</a>`;
}

// Every dynamic value below (names, subjects, grades, message text) is
// user-entered — always escape before interpolating into html.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function calendarLinksHtml(links: CalendarLinks): string {
  return `<p style="margin:22px 0 6px;font-size:13px;color:${C.grey};font-family:Arial,Helvetica,sans-serif;">Add to calendar:</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;">
<a href="${links.google}" style="color:${C.blue};margin-right:14px;">Google Calendar</a>
<a href="${links.outlook}" style="color:${C.blue};margin-right:14px;">Outlook</a>
<a href="${links.ics}" style="color:${C.blue};">Download .ics</a>
</p>`;
}

export function adminBookedEmail({
  subName,
  teacherName,
  dateLabel,
  subjectLine,
  calendarLinks,
}: {
  subName: string;
  teacherName: string;
  dateLabel: string;
  subjectLine: string;
  calendarLinks: CalendarLinks;
}): EmailContent {
  const subject = "You've been booked";
  const text = `The office booked you for ${teacherName || "a class"} on ${dateLabel}${subjectLine ? ` (${subjectLine})` : ""}. Add to calendar: ${calendarLinks.google}`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(subName)},</p>
<p>The office booked you for <strong>${escapeHtml(teacherName || "a class")}</strong> on <strong>${escapeHtml(dateLabel)}</strong>${subjectLine ? ` (${escapeHtml(subjectLine)})` : ""}.</p>
${calendarLinksHtml(calendarLinks)}`
  );
  return { subject, text, html };
}

export function requestSentEmail({
  subName,
  teacherName,
  dateLabel,
  subjectLine,
  gradeLine,
  respondUrl,
}: {
  subName: string;
  teacherName: string;
  dateLabel: string;
  subjectLine: string;
  gradeLine: string;
  respondUrl: string;
}): EmailContent {
  const subject = "New substitute request";
  const text = `${teacherName || "A teacher"} requested you to sub on ${dateLabel}${subjectLine ? ` for ${subjectLine}` : ""}${gradeLine ? ` (${gradeLine})` : ""}. Accept: ${respondUrl}?action=accept — Decline: ${respondUrl}?action=decline`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(subName)},</p>
<p><strong>${escapeHtml(teacherName || "A teacher")}</strong> requested you to sub on <strong>${escapeHtml(dateLabel)}</strong>${subjectLine ? ` for ${escapeHtml(subjectLine)}` : ""}${gradeLine ? ` (${escapeHtml(gradeLine)})` : ""}.</p>
<div style="margin:22px 0 8px;">
${solidButton("Accept", `${respondUrl}?action=accept`, C.teal)}
${outlineButton("Decline", `${respondUrl}?action=decline`, C.red)}
</div>
<p style="font-size:13px;color:${C.grey};">One more click to confirm — no login needed. Or log in to the portal to see full details first.</p>`
  );
  return { subject, text, html };
}

export function requestAcceptedEmail({
  teacherName,
  subName,
  dateLabel,
  calendarLinks,
}: {
  teacherName: string;
  subName: string;
  dateLabel: string;
  calendarLinks: CalendarLinks;
}): EmailContent {
  const subject = "Substitute confirmed";
  const text = `${subName} has confirmed your request for ${dateLabel}. Add to calendar: ${calendarLinks.google}`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(teacherName)},</p>
<p><strong>${escapeHtml(subName)}</strong> has confirmed your request for <strong>${escapeHtml(dateLabel)}</strong>.</p>
${calendarLinksHtml(calendarLinks)}`
  );
  return { subject, text, html };
}

export function requestDeclinedEmail({
  teacherName,
  subName,
  dateLabel,
}: {
  teacherName: string;
  subName: string;
  dateLabel: string;
}): EmailContent {
  const subject = "Substitute declined";
  const text = `${subName} has declined your request for ${dateLabel}.`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(teacherName)},</p>
<p><strong>${escapeHtml(subName)}</strong> has declined your request for <strong>${escapeHtml(dateLabel)}</strong>. Head back to the portal to find another substitute.</p>`
  );
  return { subject, text, html };
}

export function subConfirmationEmail({
  subName,
  teacherName,
  dateLabel,
  calendarLinks,
}: {
  subName: string;
  teacherName: string;
  dateLabel: string;
  calendarLinks: CalendarLinks;
}): EmailContent {
  const subject = "You're confirmed to sub";
  const text = `You're confirmed to sub for ${teacherName} on ${dateLabel}. Add to calendar: ${calendarLinks.google}`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(subName)},</p>
<p>You're confirmed to sub for <strong>${escapeHtml(teacherName)}</strong> on <strong>${escapeHtml(dateLabel)}</strong>.</p>
${calendarLinksHtml(calendarLinks)}`
  );
  return { subject, text, html };
}

export function subDeclineAckEmail({
  subName,
  teacherName,
  dateLabel,
}: {
  subName: string;
  teacherName: string;
  dateLabel: string;
}): EmailContent {
  const subject = "You declined this request";
  const text = `You declined ${teacherName}'s request for ${dateLabel}. No action needed.`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(subName)},</p>
<p>You declined <strong>${escapeHtml(teacherName)}</strong>'s request for <strong>${escapeHtml(dateLabel)}</strong>. No action needed — the teacher has been notified.</p>`
  );
  return { subject, text, html };
}

export function bookingCancelledEmail({
  toName,
  otherName,
  dateLabel,
  perspective,
}: {
  toName: string;
  otherName: string;
  dateLabel: string;
  perspective: "sub" | "teacher";
}): EmailContent {
  const subject = "Booking cancelled";
  const text =
    perspective === "sub"
      ? `${otherName || "The teacher"}'s request for you on ${dateLabel} has been cancelled.`
      : `The booking with ${otherName || "your substitute"} on ${dateLabel} has been cancelled.`;
  const htmlText =
    perspective === "sub"
      ? `${escapeHtml(otherName || "The teacher")}'s request for you on <strong>${escapeHtml(dateLabel)}</strong> has been cancelled.`
      : `The booking with ${escapeHtml(otherName || "your substitute")} on <strong>${escapeHtml(dateLabel)}</strong> has been cancelled.`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(toName)},</p>
<p>${htmlText}</p>`
  );
  return { subject, text, html };
}

export function newBookingRequestAdminEmail({
  adminName,
  teacherName,
  subName,
  dateLabel,
  subjectLine,
}: {
  adminName: string;
  teacherName: string;
  subName: string;
  dateLabel: string;
  subjectLine: string;
}): EmailContent {
  const subject = "New substitute request";
  const text = `${teacherName || "A teacher"} requested ${subName} to sub on ${dateLabel}${subjectLine ? ` for ${subjectLine}` : ""}.`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(adminName)},</p>
<p><strong>${escapeHtml(teacherName || "A teacher")}</strong> requested <strong>${escapeHtml(subName)}</strong> to sub on <strong>${escapeHtml(dateLabel)}</strong>${subjectLine ? ` for ${escapeHtml(subjectLine)}` : ""}.</p>`
  );
  return { subject, text, html };
}

export function passwordResetEmail({
  toName,
  resetUrl,
}: {
  toName: string;
  resetUrl: string;
}): EmailContent {
  const subject = "Reset your SubMe password";
  const text = `Hi ${toName}, reset your password here: ${resetUrl} — This link expires in 1 hour. If you didn't request this, you can ignore this email.`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(toName)},</p>
<p>Click below to set a new password. This link expires in 1 hour.</p>
<div style="margin:22px 0 8px;">${solidButton("Reset password", resetUrl, C.navy)}</div>
<p style="font-size:13px;color:${C.grey};">If you didn't request this, you can safely ignore this email — your password won't change.</p>`
  );
  return { subject, text, html };
}

export function newMessageEmail({
  toName,
  senderName,
  dateLabel,
  messageBody,
  portalUrl,
}: {
  toName: string;
  senderName: string;
  dateLabel: string;
  messageBody: string;
  portalUrl: string;
}): EmailContent {
  const subject = "New message about your booking";
  const text = `${senderName} sent a message about your booking on ${dateLabel}: "${messageBody}" — Reply in the portal: ${portalUrl}`;
  const html = shell(
    subject,
    `<p>Hi ${escapeHtml(toName)},</p>
<p><strong>${escapeHtml(senderName)}</strong> sent a message about your booking on <strong>${escapeHtml(dateLabel)}</strong>:</p>
<div style="margin:16px 0;padding:12px 16px;background-color:${C.greyLight};border-radius:8px;color:#3F4552;white-space:pre-wrap;">${escapeHtml(messageBody)}</div>
<div style="margin-top:20px;">${solidButton("Reply in portal", portalUrl, C.navy)}</div>`
  );
  return { subject, text, html };
}
