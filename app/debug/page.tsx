// app/debug/login/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function DebugLogin() {
  const [me, setMe] = useState<any>(null);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  async function refresh() {
    const r = await fetch("/api/me", { cache: "no-store" });
    setMe(await r.json());
  }
  useEffect(() => { refresh(); }, []);

  async function login() {
    setMsg("");
    const r = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, maxAgeDays: 7 }),
    });
    const j = await r.json();
    setMsg(`status=${r.status} → ${JSON.stringify(j)}`);
    await refresh();
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
  }

  return (
    <main className="p-6 text-white">
      <h1 className="text-xl mb-2">Debug Login</h1>
      <pre className="bg-black/40 p-3 rounded border border-white/20 mb-3">
        /api/me → {JSON.stringify(me, null, 2)}
      </pre>
      <div className="flex gap-2 mb-2">
        <input className="px-3 py-2 rounded bg-black/40 border border-white/20"
          value={pw} onChange={(e)=>setPw(e.target.value)} placeholder="ADMIN_PASSWORD" type="password" />
        <button onClick={login} className="px-3 py-2 rounded border border-white/20 bg-white/10 hover:bg-white/20">
          Login
        </button>
        <button onClick={logout} className="px-3 py-2 rounded border border-white/20 bg-white/10 hover:bg-white/20">
          Logout
        </button>
      </div>
      {msg && <div className="text-sm text-white/70">{msg}</div>}
    </main>
  );
}
