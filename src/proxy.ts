import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Gate the three portal routes on a real session. Per-role checks (does this
// session's role match /teacher vs /sub vs /admin) happen in each route's page
// component, since that's where we also need a DB lookup to resolve the numeric
// Teacher/Substitute/Admin id — middleware runs on the edge and stays DB-free here.
export default auth((req) => {
  const isProtected = ["/stfrancishouston/teacher", "/stfrancishouston/sub", "/stfrancishouston/admin"].some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );
  if (isProtected && !req.auth) {
    const signInUrl = new URL("/stfrancishouston/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/stfrancishouston/teacher/:path*", "/stfrancishouston/sub/:path*", "/stfrancishouston/admin/:path*"],
};
