// Thin client-side fetch wrappers around the API routes in src/app/api/. Kept
// separate from the portal client components so they stay focused on rendering.
import type { AppState, Booking, Message, Sub, Teacher } from "./types";

async function json<T>(resPromise: Promise<Response>): Promise<T> {
  const res = await resPromise;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

const post = (url: string, body?: unknown) =>
  fetch(url, {
    method: "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const patch = (url: string, body: unknown) =>
  fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function fetchState(): Promise<AppState> {
  return json<AppState>(fetch("/api/state"));
}

// Returns null (no-op) on a 409 date clash, matching the prototype's silent no-op behavior.
export async function sendRequest(payload: {
  subId: number;
  dk: string;
  teacherId: number;
  teacherName: string;
  subject: string;
  grade: string;
  notes: string;
}): Promise<Booking | null> {
  const res = await post("/api/requests", payload);
  if (!res.ok) return null;
  return res.json();
}

export function adminCreateBooking(payload: {
  subId: number;
  dk: string;
  teacherId: number;
  teacherName: string;
  subject: string;
  grade: string;
  notes: string;
}) {
  return json<Booking>(post("/api/requests", { ...payload, source: "admin" }));
}

export function respondRequest(id: string, accept: boolean) {
  return json<Booking>(post(`/api/requests/${id}/respond`, { accept }));
}

export function cancelRequest(id: string) {
  return json<Booking>(post(`/api/requests/${id}/cancel`));
}

export function updateRequestDetails(
  id: string,
  details: { lessonPlan: string; schedule: string; attendance: string; notes: string }
) {
  return json<Booking>(post(`/api/requests/${id}/details`, details));
}

export function reassignBooking(id: string, subId: number) {
  return json<Booking>(post(`/api/requests/${id}/reassign`, { subId }));
}

export function rescheduleBooking(id: string, update: { subId: number; dk: string }) {
  return json<Booking>(post(`/api/requests/${id}/reschedule`, update));
}

export function fetchMessages(requestId: string) {
  return json<Message[]>(fetch(`/api/requests/${requestId}/messages`));
}

export function fetchAllMessages() {
  return json<Message[]>(fetch("/api/messages"));
}

export function sendMessage(requestId: string, body: string) {
  return json<Message>(post(`/api/requests/${requestId}/messages`, { body }));
}

export function submitFeedback(id: string, subFeedback: string) {
  return json<Booking>(post(`/api/requests/${id}/feedback`, { subFeedback }));
}

export function updateSubProfile(
  id: number,
  updates: Partial<
    Pick<Sub, "bio" | "subjects" | "division" | "additionalInfo" | "photo" | "phone" | "notifyBookingUpdates" | "notifyMessages">
  >
) {
  return json<Sub>(patch(`/api/subs/${id}`, updates));
}

export function setSubAvailability(id: number, dk: string, status: "available" | "unavailable") {
  return json<Sub>(post(`/api/subs/${id}/availability`, { dk, status }));
}

export function updateTeacherProfile(id: number, updates: Partial<Pick<Teacher, "photo" | "notifyBookingUpdates" | "notifyMessages">>) {
  return json<Teacher>(patch(`/api/teachers/${id}`, updates));
}

export interface AllowedUserRow {
  id: string;
  email: string;
  role: "teacher" | "substitute" | "admin";
  hasPassword: boolean;
  createdAt: string;
}

export function fetchAllowedUsers() {
  return json<AllowedUserRow[]>(fetch("/api/allowed-users"));
}

export function addAllowedUser(email: string, role: "teacher" | "substitute" | "admin", password?: string) {
  return json<AllowedUserRow>(post("/api/allowed-users", { email, role, password: password || undefined }));
}

export function removeAllowedUser(id: string) {
  return json<{ ok: true }>(fetch(`/api/allowed-users/${id}`, { method: "DELETE" }));
}

export function setAllowedUserPassword(id: string, password: string) {
  return json<{ ok: true; hasPassword: boolean }>(patch(`/api/allowed-users/${id}`, { password }));
}
