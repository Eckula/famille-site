// app/admin/page.tsx
"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = { role: "guest" | "viewer" | "editor" | "admin"; exp?: number } | null;

export default function AdminPage() {
  const [me, setMe] = useState<Me>(null);
  const [pw, setPw] = useState("");
  const [nextUrl, setNextUrl] = useState<string>("");

  // Lire ?next= sans useSearchParams (évite le warning build)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setNextUrl(sp.get("next") || "");
    }
  }, []);

  // Charger mon statut
  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { role: "guest" }))
      .then(setMe)
      .catch(() => setMe({ role: "guest" }));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });

    if (!r.ok) {
      alert("Mot de passe invalide.");
      return;
    }

    // Redirection "pleine page" (assure l'envoi du cookie httpOnly immédiatement)
    if (nextUrl) {
      window.location.href = nextUrl;
      return;
    }

    setPw("");
    const meNow = await fetch("/api/me", { cache: "no-store" }).then((res) => res.json());
    setMe(meNow);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Reload pour éviter tout état SPA collant
    window.location.href = "/admin";
  }

  // ⬇️ Ici on traite guest comme "non connecté"
  if (!me || me.role === "guest") {
    return (
      <main className="px-6 py-24 text-white">
        <h1 className="text-3xl font-bold mb-4">Espace Admin</h1>
        <p className="mb-4 text-white/80">Espace réservé aux membres autorisés.</p>
        <form onSubmit={login} className="max-w-md space-y-3">
          <label className="block text-sm">Mot de passe</label>
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type="password"
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
            placeholder="Entrez le mot de passe…"
          />
          <button className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 hover:bg-white/20">
            Se connecter
          </button>
        </form>
      </main>
    );
  }

  // Connecté
  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Espace admin</h1>
      <p className="mb-2">Espace réservé aux membres autorisés.</p>

      <div className="mt-3 inline-flex items-center gap-3 rounded-xl bg-black/60 border border-white/20 px-3 py-2">
        <span>Connecté en tant que <b>{me.role}</b></span>
        <button onClick={logout} className="rounded-full border border-white/30 px-3 py-1 hover:bg-white/10">
          Se déconnecter
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link prefetch={false} href="/admin/upload" className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10">
          ⬆️ Uploader des médias
        </Link>

        <Link prefetch={false} href="/galerie?tab=images" className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10">
          🖼️ Photos
        </Link>

        <Link prefetch={false} href="/galerie?tab=videos" className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10">
          🎞️ Vidéos
        </Link>

        <Link prefetch={false} href="/galerie?tab=audio" className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10">
          🎵 Audio
        </Link>

        <Link prefetch={false} href="/galerie?tab=documents" className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10">
          📄 Aller aux documents
        </Link>
      </div>
    </main>
  );
}
