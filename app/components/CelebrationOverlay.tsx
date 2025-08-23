// /app/components/CelebrationOverlay.tsx
'use client';

import React from 'react';

type Mode = 'birthday' | 'memorial' | 'both';

export default function CelebrationOverlay({
  mode,
  onDone,
  autoHideMs = 9000,
}: { mode: Mode; onDone?: () => void; autoHideMs?: number }) {
  const [show, setShow] = React.useState(true);

  // Respecte l’accessibilité
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  React.useEffect(() => {
    if (reduce) { setShow(false); return; }
    const t = setTimeout(() => { setShow(false); onDone?.(); }, autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, onDone, reduce]);

  if (!show || reduce) return null;

  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 640px)').matches;

  // Densité adaptée mobile/desktop
  const FALL_COUNT  = isMobile ? 50 : 110; // pluie
  const BURST_COUNT = isMobile ? 16 : 32;  // explosion centrale

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  // Emojis pour fleurs
  const flower = () => (Math.random() < 0.33 ? '🌸' : Math.random() < 0.5 ? '💮' : '🌺');

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Bouton fermer */}
      <button
        onClick={() => { setShow(false); onDone?.(); }}
        style={{
          position: 'fixed', right: 10, top: 10, zIndex: 10000,
          pointerEvents: 'auto',
          background: 'rgba(0,0,0,.5)', color: '#fff',
          border: '1px solid rgba(255,255,255,.25)', borderRadius: 999,
          padding: '6px 10px', fontSize: 12
        }}
      >Fermer ✕</button>

      {/* === ANNIVERSAIRES : confettis + burst === */}
      {(mode === 'birthday' || mode === 'both') && (
        <>
          {/* Pluie de confettis */}
          {Array.from({ length: FALL_COUNT }).map((_, i) => {
            const left = `${rand(0, 100)}%`;
            const delay = `${rand(0, 2)}s`;
            const dur = `${rand(5, 8)}s`;
            const rotate = `${rand(-180, 180)}deg`;
            const scale = rand(0.9, 1.4);
            const w = rand(8, 14), h = rand(14, 20);
            return (
              <span
                key={`c${i}`}
                style={{
                  position: 'absolute', top: '-12vh', left,
                  width: w, height: h,
                  background: `hsl(${Math.floor(rand(0,360))}deg, 95%, 60%)`,
                  transform: `rotate(${rotate}) scale(${scale})`,
                  animation: `fall-linear ${dur} linear ${delay} forwards`,
                  borderRadius: 3, filter: 'saturate(1.3)',
                  boxShadow: '0 0 8px rgba(0,0,0,.18)',
                }}
              />
            );
          })}
          {/* Explosion centrale (rayons) */}
          {Array.from({ length: BURST_COUNT }).map((_, i) => {
            const angle = `${(360 / BURST_COUNT) * i + rand(-6, 6)}deg`;
            const color = `hsl(${Math.floor(rand(0,360))}deg, 95%, 62%)`;
            const delay = `${rand(0, .6)}s`;
            const dur = `${rand(1.0, 1.4)}s`;
            return (
              <span
                key={`burst-conf-${i}`}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: 10, height: 10, background: color, borderRadius: 3,
                  transform: 'translate(-50%, -50%)',
                  animation: `burst  ${dur} cubic-bezier(.2,.7,.2,1) ${delay} forwards`,
                  // angle via CSS var
                  ['--angle' as any]: angle,
                  boxShadow: '0 0 10px rgba(0,0,0,.2)',
                }}
              />
            );
          })}
          {/* Ondes lumineuses */}
          <span className="ring1" />
          <span className="ring2" />
        </>
      )}

      {/* === SOUVENIRS : pluie de fleurs + burst pétales === */}
      {(mode === 'memorial' || mode === 'both') && (
        <>
          {Array.from({ length: FALL_COUNT }).map((_, i) => {
            const left = `${rand(0, 100)}%`;
            const delay = `${rand(0, 2)}s`;
            const dur = `${rand(7, 10)}s`;
            const size = `${rand(20, 30)}px`;
            const drift = rand(-30, 30);
            const rotate = `${rand(-20, 20)}deg`;
            return (
              <span
                key={`f${i}`}
                style={{
                  position: 'absolute', top: '-12vh', left,
                  fontSize: size, transform: `rotate(${rotate})`,
                  animation: `fall-sway ${dur} linear ${delay} forwards`,
                  textShadow: '0 0 6px rgba(255,255,255,.4)',
                }}
              >
                <span style={{ display: 'inline-block', transform: `translateX(${drift}px)` }}>
                  {flower()}
                </span>
              </span>
            );
          })}
          {Array.from({ length: BURST_COUNT }).map((_, i) => {
            const angle = `${(360 / BURST_COUNT) * i + rand(-6, 6)}deg`;
            const delay = `${rand(0, .6)}s`;
            const dur = `${rand(1.1, 1.6)}s`;
            return (
              <span
                key={`burst-flower-${i}`}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: `burst  ${dur} cubic-bezier(.2,.7,.2,1) ${delay} forwards`,
                  ['--angle' as any]: angle,
                  fontSize: `${rand(18, 28)}px`,
                }}
              >
                {flower()}
              </span>
            );
          })}
          <span className="ring1 memorial" />
          <span className="ring2 memorial" />
        </>
      )}

      <style jsx>{`
        @keyframes fall-linear {
          to { transform: translateY(115vh); opacity: 0.95; }
        }
        @keyframes fall-sway {
          0%   { transform: translateY(0vh) rotate(0deg);  opacity: 1; }
          100% { transform: translateY(115vh) rotate(360deg); opacity: 0.95; }
        }
        @keyframes burst {
          0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);    opacity: 1; }
          100%{ transform: translate(-50%, -50%) rotate(var(--angle)) translateX(45vw); opacity: 0; }
        }
        .ring1, .ring2 {
          position: absolute;
          left: 50%; top: 50%;
          width: 2px; height: 2px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          pointer-events: none;
          box-shadow: 0 0 0 0 rgba(255,255,255,.8);
          animation: ring 1.4s ease-out forwards;
        }
        .ring2 { animation-delay: .2s; }
        .ring1.memorial, .ring2.memorial { box-shadow: 0 0 0 0 rgba(255,192,203,.9); }
        @keyframes ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,255,255,.9); }
          100% { box-shadow: 0 0 0 120vmax rgba(255,255,255,0); }
        }

        @media (prefers-reduced-motion: reduce) {
          :global(#__next) { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
