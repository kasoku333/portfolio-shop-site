import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminSession: { name: string } | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let adminSession: { name: string } | null = null;

  // Try simple JWT admin session first (password-based login)
  try {
    const cookies = parseCookieHeader(opts.req.headers.cookie || "");
    const sessionCookie = cookies[COOKIE_NAME];
    if (sessionCookie) {
      const session = await sdk.verifySession(sessionCookie);
      if (session && session.openId === "admin") {
        adminSession = { name: session.name };
      }
    }
  } catch {
    // Ignore verification errors
  }

  // Try OAuth-based authentication (if OAuth server is configured)
  if (!adminSession) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminSession,
  };
}
