"use client";

import { useState } from "react";
import { PlusCircle, Check } from "lucide-react";
import { C, SUBJECTS } from "@/lib/constants";
import { dateKey, dkToDate, prettyDate, toInputValue } from "@/lib/dates";
import { SubjectChip } from "@/components/shared/SubjectChip";
import type { Sub, Teacher } from "@/lib/types";

export interface NewBookingPrefill {
  teacherId?: number;
  subId?: number;
  dk?: string;
  subject?: string;
  grade?: string;
  notes?: string;
}

export function AdminNewBooking({
  subs,
  teachers,
  onCreate,
  prefill,
}: {
  subs: Sub[];
  teachers: Teacher[];
  onCreate: (payload: { teacherId: number; teacherName: string; subId: number; dk: string; subject: string; grade: string; notes: string }) => void;
  prefill: NewBookingPrefill | null;
}) {
  const [teacherId, setTeacherId] = useState(prefill?.teacherId || teachers[0]?.id);
  const [subId, setSubId] = useState(prefill?.subId || subs[0]?.id);
  const [date, setDate] = useState(prefill?.dk ? toInputValue(dkToDate(prefill.dk)) : "");
  const [subject, setSubject] = useState(prefill?.subject || SUBJECTS[0]);
  const [grade, setGrade] = useState(prefill?.grade || "");
  const [notes, setNotes] = useState(prefill?.notes || "");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleSubmit = () => {
    const teacher = teachers.find((t) => t.id === teacherId);
    const sub = subs.find((s) => s.id === subId);
    if (!date || !teacher || !sub) return;
    const [y, m, d] = date.split("-").map(Number);
    const dk = dateKey(new Date(y, m - 1, d));
    onCreate({ teacherId: teacher.id, teacherName: teacher.name, subId: sub.id, dk, subject, grade: grade.trim(), notes: notes.trim() });
    setConfirmation(`Booked ${sub.name} for ${teacher.name} on ${prettyDate(new Date(y, m - 1, d))}.`);
    setGrade("");
    setNotes("");
    setDate("");
  };

  return (
    <div className="rounded-xl border bg-white p-5 max-w-xl" style={{ borderColor: "#E3E5EA" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
        Manual override
      </p>
      <p className="text-sm mb-4" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
        This books the substitute directly and marks the date unavailable, regardless of what they currently have marked.
      </p>

      {confirmation && (
        <div className="mb-4 rounded-lg px-3 py-2 text-sm flex items-center gap-2" style={{ backgroundColor: "#E4F2EF", color: C.teal, fontFamily: "Barlow, sans-serif" }}>
          <Check size={15} /> {confirmation}
        </div>
      )}

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>Teacher</label>
      <select
        value={teacherId}
        onChange={(e) => setTeacherId(Number(e.target.value))}
        className="w-full text-sm px-3 py-2 rounded-lg border outline-none mb-3"
        style={{ borderColor: "#D9DCE3", fontFamily: "Barlow, sans-serif" }}
      >
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
        ))}
      </select>

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>Substitute</label>
      <select
        value={subId}
        onChange={(e) => setSubId(Number(e.target.value))}
        className="w-full text-sm px-3 py-2 rounded-lg border outline-none mb-3"
        style={{ borderColor: "#D9DCE3", fontFamily: "Barlow, sans-serif" }}
      >
        {subs.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-lg border outline-none mb-3"
        style={{ borderColor: "#D9DCE3", fontFamily: "Barlow, sans-serif" }}
      />

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>Subject</label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} active={subject === s} onClick={() => setSubject(s)} tone={C.blue} />
        ))}
      </div>

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>Grade level</label>
      <input
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder="e.g., 3rd Grade"
        className="w-full text-sm rounded-lg border p-2 outline-none mb-3"
        style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
      />

      <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
        Notes <span style={{ fontWeight: 400, color: C.grey }}>(optional)</span>
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full text-sm rounded-lg border p-2 outline-none resize-none mb-4"
        style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "PT Serif, serif" }}
      />

      <button
        onClick={handleSubmit}
        disabled={!date}
        className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5"
        style={{ backgroundColor: date ? C.navy : "#E3E5EA", color: date ? "white" : "#9CA0AA", fontFamily: "Barlow, sans-serif" }}
      >
        <PlusCircle size={15} /> Create booking
      </button>
    </div>
  );
}
