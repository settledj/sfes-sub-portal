"use client";

import { useState } from "react";
import { ClipboardList, Search, Bell, PlusCircle, ShieldCheck } from "lucide-react";
import { C } from "@/lib/constants";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminPeople } from "@/components/admin/AdminPeople";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminNewBooking, type NewBookingPrefill } from "@/components/admin/AdminNewBooking";
import { AdminAccess, type AllowedUserRow } from "@/components/admin/AdminAccess";
import type { Sub, Teacher, Booking, Notification } from "@/lib/types";

export function AdminPortal({
  subs,
  teachers,
  requests,
  onApprove,
  onDecline,
  onCancel,
  onReschedule,
  onCreate,
  onSaveDetails,
  onReassign,
  notifications,
  allowedUsers,
  onAddAllowedUser,
  onRemoveAllowedUser,
  onSetAllowedUserPassword,
}: {
  subs: Sub[];
  teachers: Teacher[];
  requests: Booking[];
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string, update: { subId: number; dk: string }) => void;
  onCreate: (payload: { teacherId: number; teacherName: string; subId: number; dk: string; subject: string; grade: string; notes: string }) => void;
  onSaveDetails: (id: string, details: { lessonPlan: string; schedule: string; attendance: string; notes: string }) => void;
  onReassign: (id: string, newSubId: number) => void;
  notifications: Notification[];
  allowedUsers: AllowedUserRow[];
  onAddAllowedUser: (email: string, role: "teacher" | "substitute" | "admin", password: string) => Promise<void>;
  onRemoveAllowedUser: (id: string) => Promise<void>;
  onSetAllowedUserPassword: (id: string, password: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<"bookings" | "people" | "notifications" | "new" | "access">("bookings");
  const [prefill, setPrefill] = useState<NewBookingPrefill | null>(null);

  const handleRebook = (r: Booking) => {
    setPrefill({ teacherId: r.teacherId, subId: r.subId, dk: r.dk, subject: r.subject, grade: r.grade, notes: r.notes });
    setTab("new");
  };

  const handleQuickBookSub = (sub: Sub) => {
    setPrefill({ subId: sub.id });
    setTab("new");
  };

  return (
    <div>
      <div className="flex items-center rounded-lg p-1 bg-white border mb-6 w-fit flex-wrap" style={{ borderColor: "#E3E5EA" }}>
        <button
          onClick={() => setTab("bookings")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold"
          style={{ fontFamily: "Barlow, sans-serif", backgroundColor: tab === "bookings" ? C.navy : "transparent", color: tab === "bookings" ? "white" : C.grey }}
        >
          <ClipboardList size={14} /> All Bookings
        </button>
        <button
          onClick={() => setTab("people")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold"
          style={{ fontFamily: "Barlow, sans-serif", backgroundColor: tab === "people" ? C.navy : "transparent", color: tab === "people" ? "white" : C.grey }}
        >
          <Search size={14} /> People
        </button>
        <button
          onClick={() => setTab("notifications")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold"
          style={{ fontFamily: "Barlow, sans-serif", backgroundColor: tab === "notifications" ? C.navy : "transparent", color: tab === "notifications" ? "white" : C.grey }}
        >
          <Bell size={14} /> Notifications
        </button>
        <button
          onClick={() => setTab("new")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold"
          style={{ fontFamily: "Barlow, sans-serif", backgroundColor: tab === "new" ? C.navy : "transparent", color: tab === "new" ? "white" : C.grey }}
        >
          <PlusCircle size={14} /> New Booking
        </button>
        <button
          onClick={() => setTab("access")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold"
          style={{ fontFamily: "Barlow, sans-serif", backgroundColor: tab === "access" ? C.navy : "transparent", color: tab === "access" ? "white" : C.grey }}
        >
          <ShieldCheck size={14} /> Access
        </button>
      </div>

      {tab === "bookings" && (
        <AdminBookings requests={requests} subs={subs} onApprove={onApprove} onDecline={onDecline} onCancel={onCancel} onReschedule={onReschedule} onRebook={handleRebook} />
      )}
      {tab === "people" && (
        <AdminPeople subs={subs} teachers={teachers} requests={requests} onCancel={onCancel} onQuickBookSub={handleQuickBookSub} onSaveDetails={onSaveDetails} onReassign={onReassign} />
      )}
      {tab === "notifications" && <AdminNotifications notifications={notifications} />}
      {tab === "new" && (
        <AdminNewBooking subs={subs} teachers={teachers} onCreate={onCreate} prefill={prefill} />
      )}
      {tab === "access" && (
        <AdminAccess users={allowedUsers} onAdd={onAddAllowedUser} onRemove={onRemoveAllowedUser} onSetPassword={onSetAllowedUserPassword} />
      )}
    </div>
  );
}
