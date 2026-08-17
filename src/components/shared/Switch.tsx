"use client";

import { C } from "@/lib/constants";

// Small pill toggle — no existing switch-style control in this app (only
// SubjectChip-style active/inactive buttons), so this is the first one.
export function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full transition-colors disabled:opacity-60"
      style={{ width: 40, height: 24, backgroundColor: checked ? C.teal : "#D9DCE3" }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white transition-transform"
        style={{ width: 20, height: 20, left: 2, transform: checked ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}
