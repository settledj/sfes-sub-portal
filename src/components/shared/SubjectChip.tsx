import { C } from "@/lib/constants";

export function SubjectChip({
  label,
  active,
  onClick,
  tone = C.navy,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
      style={{
        fontFamily: "Barlow, sans-serif",
        letterSpacing: 0.3,
        backgroundColor: active ? tone : "white",
        color: active ? "white" : tone,
        border: `1.5px solid ${tone}`,
      }}
    >
      {label}
    </button>
  );
}
