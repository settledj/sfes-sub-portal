"use client";

import { useMemo, useState } from "react";
import { Search, Bell, PlusCircle, ShieldCheck } from "lucide-react";
import { C } from "@/lib/constants";
import { addDays, dateKey } from "@/lib/dates";
import { isRequestable } from "@/lib/availability";
import { AdminAvailability, type AdminViewMode } from "@/components/admin/AdminAvailability";
import { AdminSubstituteDirectory } from "@/components/admin/AdminSubstituteDirectory";
import { AdminDayModal } from "@/components/admin/AdminDayModal";
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
  const [tab, setTab] = useState<"people" | "notifications" | "new" | "access">("people");
  const [prefill, setPrefill] = useState<NewBookingPrefill | null>(null);

  // Shared by the snapshot's calendar widget and the substitute directory
  // below the tab content, so both stay in sync even though they're no
  // longer rendered next to each other.
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [divisionFilter, setDivisionFilter] = useState("All");
  const [viewMode, setViewMode] = useState<AdminViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [openDayDate, setOpenDayDate] = useState<Date | null>(null);

  const today = new Date();
  const isToday = dateKey(selectedDate) === dateKey(today);
  const dk = dateKey(selectedDate);

  const filteredSubs = useMemo(() => {
    return subs.filter((s) => {
      const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
      const matchesSubject = subjectFilter === "All" || s.subjects.length === 0 || s.subjects.includes(subjectFilter);
      const matchesDivision = divisionFilter === "All" || (s.division || []).includes(divisionFilter);
      return matchesQuery && matchesSubject && matchesDivision;
    });
  }, [subs, query, subjectFilter, divisionFilter]);

  const availableCount = filteredSubs.filter((s) => isRequestable(s.availability[dk])).length;

  const jumpToDate = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    const newDate = new Date(y, m - 1, d);
    setSelectedDate(newDate);
    setViewMonth(new Date(y, m - 1, 1));
  };

  const goToday = () => {
    setSelectedDate(today);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const shiftWeek = (delta: number) => setSelectedDate((d) => addDays(d, delta * 7));

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

      <div className="mb-8 pb-8" style={{ borderBottom: "1px solid #E3E5EA" }}>
        <AdminAvailability
          subs={subs}
          filteredSubs={filteredSubs}
          teachers={teachers}
          requests={requests}
          availableCount={availableCount}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          viewMonth={viewMonth}
          setViewMonth={setViewMonth}
          isToday={isToday}
          jumpToDate={jumpToDate}
          goToday={goToday}
          shiftWeek={shiftWeek}
          onDayActivate={setOpenDayDate}
          onApprove={onApprove}
          onDecline={onDecline}
          onCancel={onCancel}
          onReschedule={onReschedule}
          onRebook={handleRebook}
        />
      </div>

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

      {viewMode !== "list" && (
        <div className="mt-8 pt-8" style={{ borderTop: "1px solid #E3E5EA" }}>
          <AdminSubstituteDirectory
            subs={filteredSubs}
            requests={requests}
            dk={dk}
            selectedDate={selectedDate}
            query={query}
            setQuery={setQuery}
            subjectFilter={subjectFilter}
            setSubjectFilter={setSubjectFilter}
            divisionFilter={divisionFilter}
            setDivisionFilter={setDivisionFilter}
            onQuickBookSub={handleQuickBookSub}
          />
        </div>
      )}

      {openDayDate && (
        <AdminDayModal date={openDayDate} subs={subs} teachers={teachers} requests={requests} onClose={() => setOpenDayDate(null)} />
      )}
    </div>
  );
}
