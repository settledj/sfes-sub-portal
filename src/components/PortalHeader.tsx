import { C } from "@/lib/constants";
import { SchoolLogo } from "@/components/shared/SchoolLogo";

export function PortalHeader({ subtitle }: { subtitle: string }) {
  return (
    <header className="border-b bg-white" style={{ borderColor: "#E3E5EA" }}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center gap-3">
        <SchoolLogo height={36} />
        <div className="min-w-0 pl-3 border-l" style={{ borderColor: "#E3E5EA" }}>
          <p className="font-extrabold leading-tight truncate" style={{ fontFamily: "Barlow, sans-serif", color: C.navy, letterSpacing: 0.2 }}>
            SubMe
          </p>
          <p className="text-xs truncate" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>
            {subtitle}
          </p>
        </div>
      </div>
    </header>
  );
}
