// app/evenements/layout.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type React from 'react';
import EventsBannerCompact from '@/app/components/EventsBannerCompact';

export default function EvenementsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="px-4 pt-4 sm:px-6">
        <EventsBannerCompact href="/evenements" />
      </div>
      {children}
    </>
  );
}

