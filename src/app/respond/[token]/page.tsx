import { prisma } from "@/lib/prisma";
import { dkToDate, prettyDate } from "@/lib/dates";
import { C } from "@/lib/constants";
import { WolfMark } from "@/components/shared/WolfMark";
import { RespondActions } from "@/components/respond/RespondActions";

// Public, no-login landing page for the Accept/Decline links in the
// "New substitute request" email. The token is the authorization — see
// src/lib/respondToRequest.ts and src/app/api/requests/respond-token/[token]/route.ts.
export default async function RespondPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { token } = await params;
  const { action } = await searchParams;
  const suggestedAction = action === "accept" || action === "decline" ? action : null;

  const request = await prisma.request.findUnique({ where: { respondToken: token } });
  const [sub, teacher] = request
    ? await Promise.all([
        prisma.substitute.findUnique({ where: { id: request.subId } }),
        prisma.teacher.findUnique({ where: { id: request.teacherId } }),
      ])
    : [null, null];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: C.cream, fontFamily: "PT Serif, serif" }}>
      <div className="max-w-sm w-full">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E3E5EA" }}>
          <div className="flex justify-center mb-4">
            <WolfMark size={44} />
          </div>

          {!request || request.status !== "pending" ? (
            <>
              <p className="text-center font-bold text-lg" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                This link isn&apos;t active
              </p>
              <p className="text-center text-sm mt-2" style={{ color: C.grey }}>
                It&apos;s already been responded to, or the link has expired. Log in to the portal to check its current status.
              </p>
            </>
          ) : (
            <>
              <p className="text-center font-bold text-lg" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                {prettyDate(dkToDate(request.dk))}
              </p>
              <p className="text-center text-sm mb-5" style={{ color: C.grey }}>
                <strong>{teacher?.name || "A teacher"}</strong> requested you to sub
                {request.subject ? ` for ${request.subject}` : ""}
                {request.grade ? ` (${request.grade})` : ""}.
              </p>

              {request.notes && (
                <div className="rounded-lg px-3 py-2 mb-5 text-sm" style={{ backgroundColor: C.greyLight, color: "#3F4552" }}>
                  {request.notes}
                </div>
              )}

              <RespondActions token={token} suggestedAction={suggestedAction} />

              <p className="text-center text-xs mt-4" style={{ color: C.grey }}>
                {sub?.name ? `This request was sent to ${sub.name}. ` : ""}Not you? Log in to the portal instead.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
