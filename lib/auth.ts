// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "./rbac";

const COOKIE_NAME = "session";
const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");
export type Session = { role: Role; iat: number; exp: number };

export async function createSession(role: Role, maxAgeDays = 7) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * maxAgeDays;
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(exp).sign(SECRET);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", secure: true, path: "/",
    maxAge: 60 * 60 * 24 * maxAgeDays,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { role: (payload as any).role, iat: (payload as any).iat, exp: (payload as any).exp };
  } catch { return null; }
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
