import { C } from "@/lib/constants";
import { WolfMark } from "@/components/shared/WolfMark";

export function PortalHeader({ subtitle }: { subtitle: string }) {
  return (
    <header className="border-b bg-white" style={{ borderColor: "#E3E5EA" }}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
        <WolfMark />
        <div className="min-w-0">
          <p className="font-extrabold leading-tight truncate" style={{ fontFamily: "Barlow, sans-serif", color: C.navy, letterSpacing: 0.2 }}>
            St. Francis Episcopal School
          </p>
          <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            Substitute Availability Portal — {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
