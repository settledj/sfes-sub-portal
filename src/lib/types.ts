export type AvailabilityMap = Record<string, "unavailable" | "booked">;

export interface Sub {
  id: number;
  name: string;
  initials: string;
  phone: string;
  email: string;
  division: string[];
  subjects: string[];
  additionalInfo: string;
  bio: string;
  hrApproved: boolean;
  needsApproval: boolean;
  preferred: boolean;
  accent: string;
  photo: string | null;
  availability: AvailabilityMap;
  notifyBookingUpdates: boolean;
  notifyMessages: boolean;
}

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  room: string;
  email: string;
  phone: string;
  initials: string;
  accent: string;
  photo: string | null;
  notifyBookingUpdates: boolean;
  notifyMessages: boolean;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  notifyBookingUpdates: boolean;
  notifyMessages: boolean;
}

export type RequestStatus = "pending" | "accepted" | "declined" | "cancelled";
export type RequestSource = "teacher" | "admin";
export type PortalRole = "teacher" | "substitute" | "admin";

export interface Booking {
  id: string;
  subId: number;
  teacherId: number;
  teacherName: string;
  dk: string;
  subject: string;
  grade: string;
  notes: string;
  lessonPlan: string;
  schedule: string;
  attendance: string;
  subFeedback: string;
  status: RequestStatus;
  source: RequestSource;
}

// A single message in a booking's two-way thread between teacher and
// substitute (admins can read and post too). See src/components/shared/BookingDetailModal.tsx.
export interface Message {
  id: string;
  requestId: string;
  senderRole: PortalRole;
  senderName: string;
  body: string;
  createdAt: number;
}

export type DeliveryStatus = "sent" | "failed" | "skipped";

export interface Notification {
  id: string;
  timestamp: number;
  event: string;
  toName: string;
  toEmail: string | null;
  toPhone: string | null;
  subject: string;
  body: string;
  emailStatus: DeliveryStatus;
  emailError: string | null;
  smsStatus: DeliveryStatus;
  smsError: string | null;
}

export interface AppState {
  subs: Sub[];
  teachers: Teacher[];
  admins: Admin[];
  requests: Booking[];
  notifications: Notification[];
}
