"use client";

import * as React from "react";

export default function GatePage() {
  const [pw, setPw] = React.useState("");
  const [msg, setMsg] = React.useState<string>("");
  const [nextUrl, setNextUrl] = React.useState<string>("/");

  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const n = sp.get("next") || "/";
      setNextUrl(n);
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const r = await fetch("/api/auth/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        setMsg(j?.error || "Mot de passe incorrect.");
        return;
      }
      // on force une navigation “pleine page” pour bien prendre le cookie httpOnly
      window.location.href = nextUrl || "/";
    } catch (e: any) {
      setMsg(String(e?.message || e) || "Erreur réseau.");
    }
  }

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Accès au site</h1>
      <p className="text-white/80 mb-4">Entrez le mot de passe pour accéder au contenu.</p>

      <form onSubmit={submit} className="max-w-md space-y-3 rounded-xl border border-white/20 bg-black/40 p-4">
        {msg && <div className="text-sm text-red-300">⚠️ {msg}</div>}
        <label className="block text-sm">Mot de passe du site</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
          placeholder="••••••••"
        />
        <button className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 hover:bg-white/20">
          Entrer
        </button>
      </form>

      <p className="mt-4 text-sm text-white/60">
        Besoin d’accéder à l’espace admin ? <a href="/admin" className="underline">Connecte-toi ici</a>.
      </p>
    </main>
  );
}
