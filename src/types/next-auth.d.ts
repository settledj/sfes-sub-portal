import type { DefaultSession } from "next-auth";
import type { AllowedRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      role: AllowedRole | null;
    } & DefaultSession["user"];
  }
}
