"use client";

import { useEffect, useRef, useState } from "react";
import { C } from "@/lib/constants";

// Plain-text display with a small "Edit" affordance; clicking it swaps in a
// bordered input/textarea, focused and pre-filled. Saves onBlur (matching the
// rest of the sub profile's save pattern) and collapses back to display mode.
export function EditableField({
  value,
  placeholder,
  multiline = false,
  type = "text",
  emptyLabel = "Not set",
  onSave,
}: {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  emptyLabel?: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) (multiline ? textareaRef.current : inputRef.current)?.focus();
  }, [editing, multiline]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onSave(e.target.value);
    setEditing(false);
  };

  const fieldStyle = {
    borderColor: "#D9DCE3",
    color: "#3F4552",
    fontFamily: "PT Serif, serif",
  };

  if (editing) {
    return multiline ? (
      <textarea
        ref={textareaRef}
        defaultValue={value}
        placeholder={placeholder}
        onBlur={handleBlur}
        rows={3}
        className="w-full text-sm rounded-lg border p-2 outline-none resize-none"
        style={fieldStyle}
      />
    ) : (
      <input
        ref={inputRef}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        onBlur={handleBlur}
        className="w-full text-sm rounded-md border px-1.5 py-0.5 outline-none"
        style={fieldStyle}
      />
    );
  }

  return (
    <div className={`flex gap-2 min-w-0 ${multiline ? "items-start" : "items-center"}`}>
      <p
        className={`text-sm flex-1 min-w-0 ${multiline ? "whitespace-pre-wrap" : "truncate"}`}
        style={{ color: value ? "#3F4552" : C.grey, fontFamily: "PT Serif, serif", fontStyle: value ? "normal" : "italic" }}
      >
        {value || emptyLabel}
      </p>
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-semibold shrink-0"
        style={{ color: C.blue, fontFamily: "Barlow, sans-serif" }}
      >
        Edit
      </button>
    </div>
  );
}
