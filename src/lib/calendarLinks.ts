// "Add to calendar" links for booking confirmation emails. Bookings are
// whole-day (no time-of-day field in the data model), so these are all
// all-day events. Google/Outlook use deep links (no server round-trip);
// .ics is served by src/app/api/requests/[id]/calendar.ics/route.ts since
// email clients need a real file, not a data: URI (many strip those).
import { addDays, dkToDate, toInputValue } from "./dates";
import { getAppUrl } from "./appUrl";

function compact(dateStr: string): string {
  return dateStr.replaceAll("-", "");
}

export interface CalendarLinks {
  google: string;
  outlook: string;
  ics: string;
}

export function buildCalendarLinks(requestId: string, dk: string, title: string, details: string): CalendarLinks {
  const start = dkToDate(dk);
  const end = addDays(start, 1);
  const startStr = toInputValue(start);
  const endStr = toInputValue(end);

  const google = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${compact(startStr)}/${compact(endStr)}`,
    details,
  })}`;

  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: startStr,
    enddt: endStr,
    subject: title,
    body: details,
    allday: "true",
  })}`;

  const ics = `${getAppUrl()}/api/requests/${requestId}/calendar.ics`;

  return { google, outlook, ics };
}
