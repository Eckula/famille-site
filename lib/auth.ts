// lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "famille_admin_token";

// ⚠️ En production, ne garde pas de fallback "dev-secret"
const SECRET_BYTES = (() => {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET manquant");
  return new TextEncoder().encode(s);
})();

const ADMIN_PW  = process.env.ADMIN_PASSWORD  || "";
const EDITOR_PW = process.env.EDITOR_PASSWORD || "";
const VIEWER_PW = process.env.VIEWER_PASSWORD || "";

export type Role = "admin" | "editor" | "viewer";
export type Me =
  | { role: "guest" }
  | { role: Role; sub: string; exp: number };

const SEC_PER_DAY = 60 * 60 * 24;

function cookieBase() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/", // très important pour que la suppression fonctionne partout
  };
}

function setCookie(token: string, maxAgeDays: number) {
  const c = cookies(); // <- pas de await
  c.set({
    ...cookieBase(),
    value: token,
    maxAge: SEC_PER_DAY * maxAgeDays,
  });
}

export function clearAuthCookie() {
  const c = cookies(); // <- pas de await

  // 1) Réécrire le cookie avec une date expirée (couvre Safari/Edge)
  c.set({
    ...cookieBase(),
    value: "",
    expires: new Date(0),
  });

  // 2) Et on delete (Next 13/14/15)
  c.delete(COOKIE_NAME);
}

export async function signInWithPassword(
  pw: string,
  maxAgeDays = 7
): Promise<{ ok: boolean; role?: Role; message?: string }> {
  let role: Role | undefined;
  if (ADMIN_PW && pw === ADMIN_PW) role = "admin";
  else if (EDITOR_PW && pw === EDITOR_PW) role = "editor";
  else if (VIEWER_PW && pw === VIEWER_PW) role = "viewer";

  if (!role) return { ok: false, message: "Mot de passe invalide" };

  const expAt = Math.floor(Date.now() / 1000) + SEC_PER_DAY * maxAgeDays;

  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(role)
    .setIssuedAt()
    .setExpirationTime(expAt)
    .sign(SECRET_BYTES);

  setCookie(token, maxAgeDays);
  return { ok: true, role };
}

export async function getMe(): Promise<Me> {
  const raw = cookies().get(COOKIE_NAME)?.value as string | undefined;
  if (!raw) return { role: "guest" };
  try {
    const { payload } = await jwtVerify(raw, SECRET_BYTES);
    const role = (payload as any).role as Role | undefined;
    const exp = (payload as any).exp as number | undefined;
    const sub = ((payload as any).sub as string | undefined) ?? role ?? "viewer";
    if (!role || !exp || Date.now() / 1000 > exp) return { role: "guest" };
    return { role, sub, exp };
  } catch {
    return { role: "guest" };
  }
}

export async function requireAdmin() {
  const me = await getMe();
  if (me.role !== "admin") throw new Error("unauthorized");
  return me;
}

// --- Compat (anciens imports) ---
export { signInWithPassword as createSession };
export { clearAuthCookie as clearSession };
export { getMe as getSession };
