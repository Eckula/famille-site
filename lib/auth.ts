// lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "famille_admin_token";
const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "dev-secret");

const ADMIN_PW  = process.env.ADMIN_PASSWORD  || "";
const EDITOR_PW = process.env.EDITOR_PASSWORD || "";
const VIEWER_PW = process.env.VIEWER_PASSWORD || "" as string;

export type Role = "admin" | "editor" | "viewer";
export type Me =
  | { role: "guest" }
  | { role: Role; sub: string; exp: number };

function seconds(days: number) {
  return 60 * 60 * 24 * days;
}

/** Pose le cookie httpOnly côté serveur (typages Next variants ⇒ cast en any) */
async function setCookie(token: string, maxAgeDays: number) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production"; // en prod: Secure
  (store as any).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: seconds(maxAgeDays), // en secondes
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  (store as any).delete?.(COOKIE_NAME);
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

  const expAt = Math.floor(Date.now() / 1000) + seconds(maxAgeDays);
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(role)
    .setIssuedAt()
    .setExpirationTime(expAt)
    .sign(SECRET);

  await setCookie(token, maxAgeDays);
  return { ok: true, role };
}

export async function getMe(): Promise<Me> {
  const store = await cookies();
  const raw = (store as any).get?.(COOKIE_NAME)?.value as string | undefined;
  if (!raw) return { role: "guest" };
  try {
    const { payload } = await jwtVerify(raw, SECRET);
    const role = (payload as any)?.role as Role | undefined;
    const exp  = (payload as any)?.exp  as number | undefined;
    const sub  = (payload as any)?.sub  as string | undefined;
    if (!role || !exp || Date.now() / 1000 > exp) return { role: "guest" };
    return { role, sub: sub || role, exp };
  } catch {
    return { role: "guest" };
  }
}

export async function requireAdmin() {
  const me = await getMe();
  if (me.role !== "admin") throw new Error("unauthorized");
  return me;
}

// --- alias pour compat avec tes imports existants ---
export { signInWithPassword as createSession };
export { clearAuthCookie as clearSession };
export { getMe as getSession };
