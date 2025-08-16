// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Me = { role: "viewer" | "editor" | "admin" } | null;

export default function AdminPage() {
  const sp = useSearchParams();
  const nextUrl = sp.get("next") || "";

  const [me, setMe] = useState<Me>(null);
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        setMe(j);
        if (j && nextUrl) window.location.href = nextUrl;
      })
      .catch(() => {});
  }, [nextUrl]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j?.error || "Échec de connexion");
      return;
    }
    const j = await r.json();
    setMe({ role: j.role });
    setPw("");
    if (nextUrl) window.location.href = nextUrl;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
  }

  return (
    <div className="mx-auto max-w-3xl p-4 text-white">
      <h1 className="mb-4 text-2xl font-semibold">Espace Admin</h1>
         <p>Espace réservé aux membres autorisés.</p>
      {!me ? (
        <form onSubmit={login} className="space-y-3 rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur">
          <label className="block">
            <span>Mot de passe</span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 outline-none"
              placeholder="Entrez le mot de passe…"
              required
            />
          </label>
          {error && <div className="text-red-200">{error}</div>}
          <button type="submit" disabled={loading} className="rounded-full border border-white/30 px-4 py-2 hover:bg-white/10">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur">
            <div>
              Connecté en tant que : <strong className="capitalize">{me.role}</strong>
            </div>
            <button onClick={logout} className="mt-2 rounded-full border border-white/30 px-3 py-1.5 hover:bg-white/10">
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
