// app/jeux/page.tsx
import Link from "next/link";

export const metadata = { title: "Jeux — Famille Merenge" };

export default function JeuxPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 text-white">
      <h1 className="mb-4 text-2xl font-semibold">Jeux</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/jeux/snake"
          className="rounded-xl border border-white/25 bg-black/40 p-4 hover:bg-white/10 transition"
        >
          <div className="text-lg font-medium">Snake</div>
          <div className="text-white/70 text-sm">Flèches ou boutons tactiles.</div>
        </Link>
      </div>
    </main>
  );
}
