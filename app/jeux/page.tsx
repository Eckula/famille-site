// app/jeux/page.tsx
import Link from "next/link";

export const metadata = { title: "Jeux — Famille Merenge" };

export default function JeuxPage() {
  return (
    <main className="mx-auto max-w-5xl p-4 text-white">
      <h1 className="mb-4 text-2xl font-semibold">Jeux</h1>
      <ul className="list-inside list-disc space-y-2">
        <li>
          <Link href="/jeux/snake" className="underline hover:opacity-90">Snake</Link>
        </li>
      </ul>
    </main>
  );
}
