// app/admin/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Role = "admin" | "editor" | "viewer";
type Me = { role: Role; exp?: number } | { role: "guest" } | null;

export default function AdminPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp?.get("next") ?? ""; // ex: /galerie?tab=documents

  const [me, setMe] = useState<Me>(null);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(true);

  // Récupère l'état de session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        const j = r.ok ? await r.json() : { role: "guest" };
        if (!cancelled) setMe(j);
      } catch {
        if (!cancelled) setMe({ role: "guest" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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

    setPw("");
    // rafraîchit l'état local
    const meNow = await fetch("/api/me", { cache: "no-store" }).then(res => res.json());
    setMe(meNow);
    router.refresh();

    // si un 'next' est fourni, on y va
    if (nextUrl && nextUrl.startsWith("/")) {
      router.push(nextUrl);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe({ role: "guest" });
    router.refresh();
  }

  if (loading) {
    return (
      <main className="px-6 py-24 text-white">
        <h1 className="text-3xl font-bold mb-4">Espace Admin</h1>
        <p className="text-white/80">Chargement…</p>
      </main>
    );
  }

  // Non connecté (ou viewer invité)
  if (!me || me.role === "guest") {
    return (
      <main className="px-6 py-24 text-white">
        <h1 className="text-3xl font-bold mb-4">Espace Admin</h1>

        {nextUrl ? (
          <p className="mb-3 text-white/80">
            Authentification requise pour accéder à <code>{nextUrl}</code>.
          </p>
        ) : (
          <p className="mb-3 text-white/80">Espace réservé aux membres autorisés.</p>
        )}

        <form onSubmit={login} className="max-w-md space-y-3">
          <label className="block text-sm">Mot de passe</label>
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            type="password"
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
            placeholder="Entrez le mot de passe…"
            autoFocus
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
        <span>
          Connecté en tant que <b>{me.role}</b>
        </span>
        <button
          onClick={logout}
          className="rounded-full border border-white/30 px-3 py-1 hover:bg-white/10"
        >
          Se déconnecter
        </button>
      </div>

      {/* Raccourcis */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          prefetch={false}
          href="/admin/upload"
          className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10"
        >
          ⬆️ Uploader des médias
        </Link>

        {/* ✅ format objet pour éviter les soucis d'encodage */}
        <Link
          prefetch={false}
          href={{ pathname: "/galerie", query: { tab: "documents" } }}
          className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10"
        >
          📄 Aller aux documents
        </Link>

        <Link
          prefetch={false}
          href={{ pathname: "/galerie", query: { tab: "images" } }}
          className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10"
        >
          🖼️ Photos
        </Link>

        <Link
          prefetch={false}
          href={{ pathname: "/galerie", query: { tab: "videos" } }}
          className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10"
        >
          🎞️ Vidéos
        </Link>

        <Link
          prefetch={false}
          href={{ pathname: "/galerie", query: { tab: "audio" } }}
          className="rounded-full border border-white/30 px-3 py-2 hover:bg-white/10"
        >
          🎵 Audio
        </Link>
      </div>
    </main>
  );
}
