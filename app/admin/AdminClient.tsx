// app/admin/AdminClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Role = "admin" | "editor" | "viewer";
type Me =
  | { role: "guest" }
  | { role: Role; sub?: string; exp?: number };

export default function AdminClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // null-safe : si le typage de ta version renvoie possiblement null
  const nextUrl = (sp?.get("next") ?? "").toString();

  const [me, setMe] = useState<Me | null>(null);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  async function refreshMe() {
    try {
      const r = await fetch("/api/me", { cache: "no-store" });
      const j = await r.json();
      setMe(j as Me);
    } catch {
      setMe({ role: "guest" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  async function doLogin(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw, maxAgeDays: 7 }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) {
        setMsg(j?.message || "Mot de passe invalide");
        return;
      }
      await refreshMe();
      if (nextUrl) {
        router.replace(nextUrl);
      } else {
        router.replace("/admin");
      }
    } catch (err: any) {
      setMsg(err?.message || "Erreur de connexion");
    }
  }

  async function doLogout() {
    setMsg("");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setPw("");
    setMe({ role: "guest" });
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-white/20 bg-black/40 p-4">
        Vérification de la session…
      </div>
    );
  }

  if (!me || me.role === "guest") {
    // Formulaire de connexion
    return (
      <form
        onSubmit={doLogin}
        className="rounded-xl border border-white/20 bg-black/40 p-4 space-y-3"
      >
        <p className="text-white/80">
          Connecte-toi pour accéder aux actions (upload, suppression, etc.).
        </p>
        {msg && <p className="text-sm text-red-300">⚠️ {msg}</p>}
        <div className="flex gap-2">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Mot de passe admin"
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300/60"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
          >
            Se connecter
          </button>
        </div>
      </form>
    );
  }

  // Zone connectée
  return (
    <div className="rounded-xl border border-white/20 bg-black/40 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white/90">
            Connecté en tant que <b>{me.role}</b>
          </div>
          {me.exp && (
            <div className="text-xs text-white/60">
              Expire le{" "}
              {new Date(me.exp * 1000).toLocaleString("fr-FR")}
            </div>
          )}
        </div>
        <button
          onClick={doLogout}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
        >
          Se déconnecter
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/upload"
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
        >
          ➕ Uploader des médias
        </a>
        <a
          href="/galerie?tab=documents"
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
        >
          📄 Aller aux documents
        </a>
        <a
          href="/galerie?tab=images"
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
        >
          🖼️ Photos
        </a>
        <a
          href="/galerie?tab=videos"
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
        >
          🎬 Vidéos
        </a>
        <a
          href="/galerie?tab=audio"
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
        >
          🎵 Audio
        </a>
      </div>
    </div>
  );
}
