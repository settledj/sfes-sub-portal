"use client";

import { X } from "lucide-react";
import { C } from "@/lib/constants";
import { usernameFor } from "@/lib/people";
import { Avatar } from "@/components/shared/Avatar";
import { TeacherSchedule } from "@/components/teacher/TeacherSchedule";
import type { Teacher, Sub, Booking } from "@/lib/types";

export function AdminTeacherModal({
  teacher,
  requests,
  subs,
  onClose,
  onCancel,
  onSaveDetails,
  onReassign,
}: {
  teacher: Teacher;
  requests: Booking[];
  subs: Sub[];
  onClose: () => void;
  onCancel: (id: string) => void;
  onSaveDetails: (id: string, details: { lessonPlan: string; schedule: string; attendance: string; notes: string }) => void;
  onReassign: (id: string, newSubId: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(27,42,83,0.55)" }} onClick={onClose}>
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} color={C.grey} />
          </button>

          <div className="flex items-start gap-3 pr-6 mb-5">
            <Avatar sub={teacher} size={56} />
            <div className="min-w-0">
              <p className="font-bold text-lg truncate" style={{ fontFamily: "Barlow, sans-serif", color: C.navy }}>{teacher.name}</p>
              <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>{[teacher.subject, teacher.room].filter(Boolean).join(" · ")}</p>
              {teacher.email && (
                <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>{teacher.email}</p>
              )}
              <p className="text-xs mt-0.5" style={{ color: C.blue, fontFamily: "Barlow, sans-serif" }}>Login: {usernameFor(teacher.name)}</p>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>Schedule</p>
          <TeacherSchedule teacherId={teacher.id} requests={requests} subs={subs} onCancel={onCancel} onSaveDetails={onSaveDetails} onReassign={onReassign} />
        </div>
      </div>
    </div>
  );
}
