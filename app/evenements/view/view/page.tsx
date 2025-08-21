// app/evenements/view/page.tsx (SERVER COMPONENT)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';
import ViewClient from './ViewClient';

export default function EvenementViewPage() {
  // ✅ `useSearchParams()` est dans ViewClient (client),
  //    et on l’entoure ici d’un <Suspense>, comme demandé par Next 15.
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Chargement…</div>}>
      <ViewClient />
    </Suspense>
  );
}
