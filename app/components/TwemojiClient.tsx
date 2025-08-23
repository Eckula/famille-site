// app/components/TwemojiClient.tsx
'use client';

import { useEffect } from 'react';

// Charge twemoji à la volée (aucun impact SSR)
export default function TwemojiClient() {
  useEffect(() => {
    (async () => {
      try {
        const twemoji = (await import('twemoji')).default;
        // remplace tous les emojis par des SVG colorés
        twemoji.parse(document.body, {
          folder: 'svg',
          ext: '.svg',
          base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/',
          className: 'twemoji',
        });
      } catch {
        // si twemoji indispo, on laisse les emojis natifs
      }
    })();
  }, []);
  return null;
}
