// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const adminPw  = process.env.ADMIN_PASSWORD  || "";
  const editorPw = process.env.EDITOR_PASSWORD || "";
  const viewerPw = process.env.VIEWER_PASSWORD || "";

  let role: Role | null = null;
  if (password === adminPw) role = "admin";
  else if (password === editorPw) role = "editor";
  else if (password === viewerPw) role = "viewer";

  if (!role) return NextResponse.json({ ok:false, error:"Mot de passe invalide." }, { status: 401 });

  await createSession(role);
  return NextResponse.json({ ok:true, role });
}
