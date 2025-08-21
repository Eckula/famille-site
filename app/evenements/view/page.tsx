// app/evenements/view/page.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type ApiItem = {
  public_id: string;
  resource_type?: 'image' | 'video' | 'raw';
  secure_url?: string;
  url?: string;
};

const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  '';

function cldThumb(id: string) {
  const encoded = encodeURIComponent(id);
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_800/${encoded}`;
}

function ViewInner() {
  const sp = useSearchParams();                     // ✅ OK ici (dans un composant enfant)
  const folderId = React.useMemo(() => sp?.get('folderId') ?? '', [sp]);

  const [items, setItems] = React.useState<ApiItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        setItems(null);
        if (!folderId) { setItems([]); return; }

        const res = await fetch(
          `/api/media/list?view=folder&folderId=${encodeURIComponent(folderId)}&tab=images`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: any = await res.json();
        const list: ApiItem[] = Array.isArray(json) ? json : (json.items || json.data || []);
        const onlyImages = list.filter((x) => (x.resource_type ?? 'image') === 'image');
        if (alive) setItems(onlyImages);
      } catch (e: any) {
        if (alive) {
          setError(e?.message || 'Erreur de chargement');
          setItems([]);
        }
      }
    })();
    return () => { alive = false; };
  }, [folderId]);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Événement</h1>

      {error && <div style={{ color: 'salmon', marginBottom: 8 }}>{error}</div>}
      {items === null && <p>Chargement…</p>}
      {items && items.length === 0 && <p>Aucun média dans ce dossier.</p>}

      {items && items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {items.map((it) => (
            <a
              key={it.public_id}
              href={cldThumb(it.public_id)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                position: 'relative',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <img
                src={cldThumb(it.public_id)}
                alt={it.public_id}
                loading="lazy"
                style={{ width: '100%', height: 220, objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '6px 8px',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.2), transparent)',
                  color: '#fff',
                  fontSize: 12,
                }}
              >
                {it.public_id}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EvenementViewPage() {
  // ✅ Le hook de navigation est dans ViewInner, ici on entoure d’un Suspense
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Chargement…</div>}>
      <ViewInner />
    </Suspense>
  );
}
