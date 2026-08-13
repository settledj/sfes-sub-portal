import { Mail } from "lucide-react";
import { C } from "@/lib/constants";
import { WolfMark } from "@/components/shared/WolfMark";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream, fontFamily: "PT Serif, serif" }}>
      <div className="max-w-sm w-full mx-4 text-center">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E3E5EA" }}>
          <div className="flex justify-center mb-4">
            <WolfMark size={44} />
          </div>
          <Mail size={28} color={C.navy} className="mx-auto mb-2" />
          <p className="font-bold text-lg" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
            Check your email
          </p>
          <p className="text-sm mt-2" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            We sent you a sign-in link. It&apos;s good for a limited time — open it on this device to continue.
          </p>
        </div>
      </div>
    </div>
  );
}
