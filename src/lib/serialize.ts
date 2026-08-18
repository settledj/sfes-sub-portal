import type { Substitute, Teacher, Admin, Request as DbRequest, Notification as DbNotification, Message as DbMessage, SchoolClosure as DbSchoolClosure } from "@prisma/client";
import type { Sub, Teacher as TeacherDto, Admin as AdminDto, Booking, Notification, Message, PortalRole, DeliveryStatus, AvailabilityMap, SchoolClosure } from "./types";

export function serializeSub(s: Substitute): Sub {
  return { ...s, availability: (s.availability as AvailabilityMap) ?? {} };
}

export function serializeTeacher(t: Teacher): TeacherDto {
  return t;
}

export function serializeAdmin(a: Admin): AdminDto {
  return a;
}

export function serializeRequest(r: DbRequest): Booking {
  return {
    id: r.id,
    subId: r.subId,
    teacherId: r.teacherId,
    teacherName: r.teacherName,
    dk: r.dk,
    subject: r.subject,
    grade: r.grade,
    notes: r.notes,
    lessonPlan: r.lessonPlan,
    schedule: r.schedule,
    attendance: r.attendance,
    subFeedback: r.subFeedback,
    status: r.status,
    source: r.source,
    cancelRequestedAt: r.cancelRequestedAt?.getTime() ?? null,
    cancelRequestedBy: r.cancelRequestedBy as PortalRole | null,
  };
}

export function serializeMessage(m: DbMessage): Message {
  return {
    id: m.id,
    requestId: m.requestId,
    senderRole: m.senderRole as PortalRole,
    senderName: m.senderName,
    body: m.body,
    createdAt: m.createdAt.getTime(),
  };
}

export function serializeSchoolClosure(c: DbSchoolClosure): SchoolClosure {
  return { dk: c.dk, reason: c.reason };
}

export function serializeNotification(n: DbNotification): Notification {
  return {
    id: n.id,
    timestamp: n.timestamp.getTime(),
    event: n.event,
    toName: n.toName,
    toEmail: n.toEmail,
    toPhone: n.toPhone,
    subject: n.subject,
    body: n.body,
    emailStatus: n.emailStatus as DeliveryStatus,
    emailError: n.emailError,
    smsStatus: n.smsStatus as DeliveryStatus,
    smsError: n.smsError,
  };
}
