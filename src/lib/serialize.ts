import type { Substitute, Teacher, Admin, Request as DbRequest, Notification as DbNotification } from "@prisma/client";
import type { Sub, Teacher as TeacherDto, Admin as AdminDto, Booking, Notification, AvailabilityMap } from "./types";

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
    status: r.status,
    source: r.source,
  };
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
  };
}
