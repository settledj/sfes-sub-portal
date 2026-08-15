"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { C } from "@/lib/constants";
import { EditableAvatar } from "@/components/shared/Avatar";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { BookingDetailModal } from "@/components/shared/BookingDetailModal";
import type { Sub, Teacher, Booking } from "@/lib/types";

export function TeacherPortal({
  teacher,
  subs,
  requests,
  sendRequest,
  sendMultiRequest,
  cancelRequest,
  updateRequestDetails,
  reassignBooking,
  onLogout,
  onPhotoChange,
}: {
  teacher: Teacher;
  subs: Sub[];
  requests: Booking[];
  sendRequest: (subId: number, dk: string, details: { subject: string; grade: string; notes: string }) => void;
  sendMultiRequest: (
    subId: number,
    dks: string[],
    details: { subject: string; grade: string; notes: string }
  ) => Promise<{ sent: string[]; conflicts: string[] }>;
  cancelRequest: (id: string) => void;
  updateRequestDetails: (id: string, details: { lessonPlan: string; schedule: string; attendance: string; notes: string }) => void;
  reassignBooking: (id: string, newSubId: number) => void;
  onLogout: () => void;
  onPhotoChange: (dataUri: string) => void;
}) {
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const openBooking = requests.find((r) => r.id === openBookingId);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <EditableAvatar person={teacher} size={40} onPhotoChange={onPhotoChange} />
          <div>
            <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{teacher.name}</p>
            <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>{[teacher.subject, teacher.room].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: C.navy, fontFamily: "Barlow, sans-serif", border: "1.5px solid #D9DCE3" }}
        >
          <LogOut size={14} /> Log out
        </button>
      </div>

      <TeacherDashboard
        subs={subs}
        requests={requests}
        sendRequest={sendRequest}
        sendMultiRequest={sendMultiRequest}
        teacherId={teacher.id}
        onCancelBooking={cancelRequest}
        onOpenBooking={setOpenBookingId}
      />

      {openBooking && (
        <BookingDetailModal
          booking={openBooking}
          teacher={teacher}
          sub={subs.find((s) => s.id === openBooking.subId)}
          subs={subs}
          role="teacher"
          currentUserName={teacher.name}
          onClose={() => setOpenBookingId(null)}
          onSaveDetails={updateRequestDetails}
          onReassign={reassignBooking}
          onCancel={cancelRequest}
        />
      )}
    </div>
  );
}
