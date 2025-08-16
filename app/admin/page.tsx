// app/admin/page.tsx
import { Suspense } from "react";
import AdminClient from "./AdminClient";

export const metadata = {
  title: "Espace admin",
};

// Évite la pré-génération et les soucis avec useSearchParams côté client
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-white">
      <h1 className="mb-4 text-2xl font-semibold">Espace admin</h1>
	   <p>Espace réservé aux membres autorisés.</p>
      <Suspense
        fallback={
          <div className="rounded-xl border border-white/20 bg-black/40 p-4">
            Chargement…
          </div>
        }
      >
        <AdminClient />
      </Suspense>
    </main>
  );
}
