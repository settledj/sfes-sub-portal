"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { C } from "@/lib/constants";

// The "one more click to confirm" step for the no-login email link — see
// src/app/respond/[token]/page.tsx. Deliberately not auto-submitted on page
// load: some corporate email scanners pre-fetch links in emails to check for
// malware, which would silently accept/decline a real booking if the GET
// itself mutated. Requiring an explicit click here is what keeps that safe.
export function RespondActions({ token, suggestedAction }: { token: string; suggestedAction: "accept" | "decline" | null }) {
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  const submit = async (accept: boolean) => {
    setLoading(accept ? "accept" : "decline");
    setError(null);
    try {
      const res = await fetch(`/api/requests/respond-token/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setResult(accept ? "accepted" : "declined");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  if (result) {
    return (
      <div
        className="rounded-lg px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: result === "accepted" ? "#E4F2EF" : C.greyLight, color: result === "accepted" ? C.teal : C.grey }}
      >
        {result === "accepted" ? <Check size={16} /> : <X size={16} />}
        <p className="text-sm font-semibold" style={{ fontFamily: "Barlow, sans-serif" }}>
          {result === "accepted" ? "Accepted — the teacher has been notified." : "Declined — the teacher has been notified."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          onClick={() => submit(true)}
          disabled={loading !== null}
          autoFocus={suggestedAction === "accept"}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: C.teal, fontFamily: "Barlow, sans-serif" }}
        >
          {loading === "accept" ? "Accepting…" : "Accept"}
        </button>
        <button
          onClick={() => submit(false)}
          disabled={loading !== null}
          autoFocus={suggestedAction === "decline"}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: "white", color: C.red, border: `1.5px solid ${C.red}`, fontFamily: "Barlow, sans-serif" }}
        >
          {loading === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
      {error && (
        <p className="text-xs mt-2" style={{ color: C.red, fontFamily: "PT Serif, serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}
