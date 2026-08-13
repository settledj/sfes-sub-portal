"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { C } from "@/lib/constants";

export interface AllowedUserRow {
  id: string;
  email: string;
  role: "teacher" | "substitute" | "admin";
  createdAt: string;
}

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  teacher: { label: "Teacher", color: C.blue, bg: "#E8EEF8" },
  substitute: { label: "Substitute", color: C.teal, bg: "#E4F2EF" },
  admin: { label: "Admin", color: C.gold, bg: "#FBF2DF" },
};

export function AdminAccess({
  users,
  onAdd,
  onRemove,
}: {
  users: AllowedUserRow[];
  onAdd: (email: string, role: "teacher" | "substitute" | "admin") => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"teacher" | "substitute" | "admin">("teacher");
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!email.trim()) return;
    setError("");
    try {
      await onAdd(email.trim().toLowerCase(), role);
      setEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that email.");
    }
  };

  return (
    <div>
      <div className="rounded-xl border bg-white p-5 mb-6 max-w-xl" style={{ borderColor: "#E3E5EA" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
          Grant access
        </p>
        <p className="text-sm mb-4" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          Only emails on this list can sign in. Adding someone here does not create their Teacher/Substitute
          profile — do that separately so their name, availability, etc. show up correctly.
        </p>

        {error && <p className="text-xs mb-3" style={{ color: C.red, fontFamily: "PT Serif, serif" }}>{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="name@stfrancishouston.org"
            className="flex-1 text-sm rounded-lg border p-2.5 outline-none"
            style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="text-sm px-3 py-2.5 rounded-lg border outline-none"
            style={{ borderColor: "#D9DCE3", color: C.navy, fontFamily: "Barlow, sans-serif" }}
          >
            <option value="teacher">Teacher</option>
            <option value="substitute">Substitute</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg text-white whitespace-nowrap"
            style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
          >
            <UserPlus size={15} /> Add
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center" style={{ borderColor: "#E3E5EA" }}>
          <p className="text-sm" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>No one has been granted access yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-w-xl">
          {users.map((u) => {
            const meta = roleMeta[u.role];
            return (
              <div key={u.id} className="rounded-xl border bg-white p-3.5 flex items-center gap-3" style={{ borderColor: "#E3E5EA" }}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>{u.email}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "Barlow, sans-serif" }}>
                  {meta.label}
                </span>
                <button
                  onClick={() => onRemove(u.id)}
                  className="p-1.5 rounded-md hover:bg-gray-100"
                  title="Revoke access"
                >
                  <Trash2 size={14} color={C.red} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
