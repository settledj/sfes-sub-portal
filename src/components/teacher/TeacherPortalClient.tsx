"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { C } from "@/lib/constants";
import * as api from "@/lib/api";
import { TeacherPortal } from "@/components/teacher/TeacherPortal";
import type { AppState, Teacher } from "@/lib/types";

const emptyState: AppState = { subs: [], teachers: [], admins: [], requests: [], notifications: [] };

export function TeacherPortalClient({ teacher }: { teacher: Teacher }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [loaded, setLoaded] = useState(false);

  const refreshAll = async () => setState(await api.fetchState());

  useEffect(() => {
    let cancelled = false;
    api.fetchState().then((s) => {
      if (cancelled) return;
      setState(s);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return <p className="text-sm p-6" style={{ color: C.grey }}>Loading…</p>;
  }

  const liveTeacher = state.teachers.find((t) => t.id === teacher.id) || teacher;

  return (
    <TeacherPortal
      teacher={liveTeacher}
      subs={state.subs}
      requests={state.requests}
      sendRequest={async (subId, dk, details) => {
        const created = await api.sendRequest({ subId, dk, teacherId: liveTeacher.id, teacherName: liveTeacher.name, ...details });
        if (created) setState((s) => ({ ...s, requests: [...s.requests, created] }));
      }}
      sendMultiRequest={async (subId, dks, details) => {
        const results = await Promise.all(
          dks.map(async (dk) => ({
            dk,
            created: await api.sendRequest({ subId, dk, teacherId: liveTeacher.id, teacherName: liveTeacher.name, ...details }),
          }))
        );
        const created = results.flatMap((r) => (r.created ? [r.created] : []));
        const conflicts = results.filter((r) => !r.created).map((r) => r.dk);
        if (created.length > 0) setState((s) => ({ ...s, requests: [...s.requests, ...created] }));
        return { sent: created.map((c) => c.dk), conflicts };
      }}
      cancelRequest={async (id) => {
        await api.cancelRequest(id);
        await refreshAll();
      }}
      updateRequestDetails={async (id, details) => {
        const updated = await api.updateRequestDetails(id, details);
        setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? updated : r)) }));
      }}
      reassignBooking={async (id, newSubId) => {
        await api.reassignBooking(id, newSubId);
        await refreshAll();
      }}
      onLogout={() => signOut({ callbackUrl: "/signin" })}
      onPhotoChange={async (dataUri) => {
        const updated = await api.updateTeacherProfile(liveTeacher.id, { photo: dataUri });
        setState((s) => ({ ...s, teachers: s.teachers.map((t) => (t.id === liveTeacher.id ? updated : t)) }));
      }}
      onUpdatePreferences={async (updates) => {
        const updated = await api.updateTeacherProfile(liveTeacher.id, updates);
        setState((s) => ({ ...s, teachers: s.teachers.map((t) => (t.id === liveTeacher.id ? updated : t)) }));
      }}
    />
  );
}
