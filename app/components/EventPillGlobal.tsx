// app/components/EventPillGlobal.tsx
'use client';

import React from 'react';
import CelebrationOverlay from './CelebrationOverlay';

/* ---------- Types ---------- */
type Api = {
  ok: boolean;
  todayISO: string;
  birthdaysToday: { name: string; age?: number }[];
  memorialsToday: { name: string; years?: number }[];
};

/* ---------- Utils ---------- */
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// Lit l'intervalle de répétition (en secondes) : ?repeat=120 ou NEXT_PUBLIC_CELEBRATION_REPEAT_SEC
function getRepeatSeconds(): number {
  try {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('repeat');
    if (qp) {
      const n = parseInt(qp, 10);
      if (!Number.isNaN(n) && n >= 10) return n; // min 10s
    }
  } catch {}
  const envVal = Number(process.env.NEXT_PUBLIC_CELEBRATION_REPEAT_SEC ?? 0);
  return !Number.isNaN(envVal) && envVal >= 10 ? envVal : 0;
}

// Lit la durée d'affichage (ms) : ?autohide=15000 ou NEXT_PUBLIC_CELEBRATION_AUTOHIDE_MS (défaut 9000)
function getAutoHideMs(): number {
  try {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('autohide');
    if (qp) {
      const n = parseInt(qp, 10);
      if (!Number.isNaN(n) && n >= 3000 && n <= 120000) return n; // 3s–120s
    }
  } catch {}
  const env = Number(process.env.NEXT_PUBLIC_CELEBRATION_AUTOHIDE_MS ?? 0);
  return env >= 3000 && env <= 120000 ? env : 9000;
}

/* ---------- Component ---------- */
export default function EventPillGlobal() {
  const [data, setData] = React.useState<Api | null>(null);
  const [overlay, setOverlay] = React.useState<'birthday' | 'memorial' | 'both' | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const overlayRef = React.useRef<typeof overlay>(null);

  const reduceMotion =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fetchData = React.useCallback(async () => {
    try {
      const r = await fetch('/api/birthdays', { cache: 'no-store' });
      const j: Api = await r.json();
      setData(j);

      const hasB = !!j.birthdaysToday?.length;
      const hasM = !!j.memorialsToday?.length;

      // Forcer via URL ?celebrate=birthday|memorial|both
      const url = new URL(window.location.href);
      const force = url.searchParams.get('celebrate');
      if (force === 'birthday' || force === 'memorial' || force === 'both') {
        setOverlay(force);
        return;
      }

      // Mode normal : jouer 1x/jour/onglet si événement aujourd'hui
      if (hasB || hasM) {
        const key = `anniv-overlay:${j.todayISO}`;
        if (!sessionStorage.getItem(key) && !reduceMotion) {
          setOverlay(hasB && hasM ? 'both' : hasB ? 'birthday' : 'memorial');
          sessionStorage.setItem(key, '1');
        }
      } else {
        setOverlay(null);
      }
    } catch {
      // ignore
    }
  }, [reduceMotion]);

  React.useEffect(() => {
    fetchData();
    const onVis = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchData]);

  // Mémorise l'état courant de l'overlay pour éviter les empilements
  React.useEffect(() => {
    overlayRef.current = overlay;
  }, [overlay]);

  // 🔁 Relance périodique si repeat>0 + événement aujourd'hui + onglet visible + pas de reduced-motion
  React.useEffect(() => {
    if (!data) return;
    if (reduceMotion) return;

    const hasB = !!data.birthdaysToday?.length;
    const hasM = !!data.memorialsToday?.length;
    if (!hasB && !hasM) return;

    const repeatSec = getRepeatSeconds(); // ex: 120 pour toutes les 2 min
    if (repeatSec <= 0) return;

    const mode: 'birthday' | 'memorial' | 'both' = hasB && hasM ? 'both' : hasB ? 'birthday' : 'memorial';
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (overlayRef.current) return; // si une anim est déjà en cours, on n'empile pas
      setOverlay(mode);
    }, repeatSec * 1000);

    return () => clearInterval(id);
  }, [data, reduceMotion]);

  const hasB = !!data?.birthdaysToday?.length;
  const hasM = !!data?.memorialsToday?.length;

  /* ----- Interactions ----- */
  // Desktop: Alt+clic => confettis
  const onClick = (e: React.MouseEvent) => {
    if (e.altKey) {
      e.preventDefault();
      setOverlay('birthday');
    }
  };

  // Desktop: clic droit => ouvre la palette
  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  // Mobile: long-press => ouvre la palette
  const lpTimer = React.useRef<number | null>(null);
  const startLP = () => {
    if (lpTimer.current) clearTimeout(lpTimer.current);
    lpTimer.current = window.setTimeout(() => setMenuOpen(true), 600);
  };
  const stopLP = () => {
    if (lpTimer.current) {
      clearTimeout(lpTimer.current);
      lpTimer.current = null;
    }
  };

  // Ferme la palette en cliquant hors zone
  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest?.('#anniv-test-menu') && !el.closest?.('#anniv-pill')) setMenuOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [menuOpen]);

  /* ---------- Render ---------- */
  return (
    <>
      {/* Pilule flottante (fixe, compacte, fond bleu) */}
      <a
        id="anniv-pill"
        href="/famille/anniversaires"
        onClick={onClick}
        onContextMenu={onContextMenu}
        onTouchStart={startLP}
        onTouchEnd={stopLP}
        onTouchCancel={stopLP}
        className={cx(
          'fixed z-50 right-3 bottom-3 sm:right-5 sm:bottom-5',
          'inline-flex items-center gap-2 rounded-full border shadow-xl',
          'px-3 py-1.5 text-xs sm:text-sm',
          'text-white bg-blue-600 hover:bg-blue-500'
        )}
        style={{ borderColor: 'rgba(255,255,255,.25)' }}
        aria-label="Voir les anniversaires"
      >
        <span aria-hidden>🎂</span>
        <span className="truncate">Anniversaires &amp; souvenirs</span>

        {/* Petit indicateur discret du jour J (sans animation) */}
        {(hasB || hasM) && (
          <span
            title={
              hasB && hasM
                ? 'Anniversaire & souvenir aujourd’hui'
                : hasB
                ? 'Anniversaire aujourd’hui'
                : 'Souvenir aujourd’hui'
            }
            className={cx(
              'ml-1 inline-block h-2 w-2 rounded-full',
              hasB && !hasM && 'bg-amber-300',
              hasM && !hasB && 'bg-fuchsia-300',
              hasB && hasM && 'bg-emerald-300'
            )}
          />
        )}
      </a>

      {/* Petite palette test (long-press mobile / clic droit desktop) */}
      {menuOpen && (
        <div
          id="anniv-test-menu"
          className="fixed z-50 right-3 sm:right-5 bottom-14 rounded-xl border border-white/20 bg-black/80 text-white shadow-2xl p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOverlay('birthday')}
              className="rounded bg-blue-600 px-2.5 py-1 text-sm hover:bg-blue-500"
              title="Feux d’artifice (anniversaire)"
            >
              🎉
            </button>
            <button
              onClick={() => setOverlay('memorial')}
              className="rounded bg-fuchsia-600 px-2.5 py-1 text-sm hover:bg-fuchsia-500"
              title="Fleurs (souvenir)"
            >
              ✝️
            </button>
            <button
              onClick={() => setOverlay('both')}
              className="rounded bg-emerald-600 px-2.5 py-1 text-sm hover:bg-emerald-500"
              title="Les deux"
            >
              🎉+✝️
            </button>
            <button
              onClick={() => {
                try {
                  sessionStorage.clear();
                } catch {}
                location.reload();
              }}
              className="ml-1 rounded bg-white/15 px-2 py-1 text-xs hover:bg-white/25"
              title="Réinitialiser la journée (rejouer auto)"
            >
              Reset
            </button>
            <button
              onClick={() => setMenuOpen(false)}
              className="ml-1 rounded bg-white/15 px-2 py-1 text-xs hover:bg-white/25"
              title="Fermer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Effets plein écran — durée configurable via ?autohide=… ou env */}
      {overlay && (
        <CelebrationOverlay
          mode={overlay}
          autoHideMs={getAutoHideMs()}
          onDone={() => setOverlay(null)}
        />
      )}
    </>
  );
}
