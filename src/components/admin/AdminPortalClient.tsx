"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { C } from "@/lib/constants";
import { initialsOf } from "@/lib/people";
import * as api from "@/lib/api";
import { AdminPortal } from "@/components/admin/AdminPortal";
import type { AppState } from "@/lib/types";
import type { AllowedUserRow } from "@/lib/api";

const emptyState: AppState = { subs: [], teachers: [], admins: [], requests: [], notifications: [] };

export function AdminPortalClient({ adminName }: { adminName: string }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUserRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refreshAll = async () => setState(await api.fetchState());

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.fetchState(), api.fetchAllowedUsers()]).then(([s, users]) => {
      if (cancelled) return;
      setState(s);
      setAllowedUsers(users);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return <p className="text-sm p-6" style={{ color: C.grey }}>Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full text-white font-semibold"
            style={{ width: 40, height: 40, backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
          >
            {initialsOf(adminName)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{adminName}</p>
            <p className="text-xs" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>Admin</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
          style={{ color: C.navy, fontFamily: "Barlow, sans-serif", border: "1.5px solid #D9DCE3" }}
        >
          <LogOut size={14} /> Log out
        </button>
      </div>

      <AdminPortal
        subs={state.subs}
        teachers={state.teachers}
        requests={state.requests}
        onApprove={async (id) => {
          await api.respondRequest(id, true);
          await refreshAll();
        }}
        onDecline={async (id) => {
          await api.respondRequest(id, false);
          await refreshAll();
        }}
        onCancel={async (id) => {
          await api.cancelRequest(id);
          await refreshAll();
        }}
        onReschedule={async (id, update) => {
          await api.rescheduleBooking(id, update);
          await refreshAll();
        }}
        onCreate={async (payload) => {
          await api.adminCreateBooking(payload);
          await refreshAll();
        }}
        onSaveDetails={async (id, details) => {
          const updated = await api.updateRequestDetails(id, details);
          setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? updated : r)) }));
        }}
        onReassign={async (id, newSubId) => {
          await api.reassignBooking(id, newSubId);
          await refreshAll();
        }}
        notifications={state.notifications}
        allowedUsers={allowedUsers}
        onAddAllowedUser={async (email, role, password) => {
          const created = await api.addAllowedUser(email, role, password);
          setAllowedUsers((prev) => [created, ...prev]);
        }}
        onRemoveAllowedUser={async (id) => {
          await api.removeAllowedUser(id);
          setAllowedUsers((prev) => prev.filter((u) => u.id !== id));
        }}
        onSetAllowedUserPassword={async (id, password) => {
          const result = await api.setAllowedUserPassword(id, password);
          setAllowedUsers((prev) => prev.map((u) => (u.id === id ? { ...u, hasPassword: result.hasPassword } : u)));
        }}
      />
    </div>
  );
}
