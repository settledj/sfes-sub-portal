"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { C } from "@/lib/constants";
import * as api from "@/lib/api";
import { SubPortal } from "@/components/sub/SubPortal";
import type { AppState, Sub } from "@/lib/types";

const emptyState: AppState = { subs: [], teachers: [], admins: [], requests: [], notifications: [] };

export function SubPortalClient({ sub }: { sub: Sub }) {
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

  const liveSub = state.subs.find((s) => s.id === sub.id) || sub;

  return (
    <SubPortal
      sub={liveSub}
      teachers={state.teachers}
      requests={state.requests}
      respondRequest={async (id, accept) => {
        await api.respondRequest(id, accept);
        await refreshAll();
      }}
      onSubmitFeedback={async (id, subFeedback) => {
        const updated = await api.submitFeedback(id, subFeedback);
        setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? updated : r)) }));
      }}
      onLogout={() => signOut({ callbackUrl: "/signin" })}
      onUpdateProfile={async (updates) => {
        const updated = await api.updateSubProfile(liveSub.id, updates);
        setState((s) => ({ ...s, subs: s.subs.map((sb) => (sb.id === liveSub.id ? updated : sb)) }));
      }}
      onSetDayStatus={async (dk, status) => {
        const updated = await api.setSubAvailability(liveSub.id, dk, status);
        setState((s) => ({ ...s, subs: s.subs.map((sb) => (sb.id === liveSub.id ? updated : sb)) }));
      }}
      onPhotoChange={async (dataUri) => {
        const updated = await api.updateSubProfile(liveSub.id, { photo: dataUri });
        setState((s) => ({ ...s, subs: s.subs.map((sb) => (sb.id === liveSub.id ? updated : sb)) }));
      }}
    />
  );
}
