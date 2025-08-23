// app/api/cron/daily/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';

type ComputeReturn = {
  todayISO?: string;
  date?: string;
  birthdaysToday?: any[];
  memorialsToday?: any[];
  upcomingIn7Days?: { birthdays?: any[]; memorials?: any[] };
  upcomingBirthdays?: any[];
  upcomingMemorials?: any[];
};

/** Charge la lib et appelle computeBirthdays en gérant les différentes signatures */
async function callCompute(tz: string, at?: string): Promise<ComputeReturn> {
  const mod = await import('@/lib/birthdays');
  const fn: any =
    (mod as any).computeBirthdays ||
    (mod as any).default ||
    (mod as any).compute ||
    null;
  if (!fn) throw new Error('Aucune fonction computeBirthdays trouvée');

  // Essais avec différentes signatures connues
  if (at) {
    try {
      return (await fn(tz, { at, horizonDays: 7 })) as ComputeReturn;
    } catch {}
    try {
      return (await fn(tz, at)) as ComputeReturn;
    } catch {}
  }
  try {
    return (await fn(tz, { horizonDays: 7 })) as ComputeReturn;
  } catch {}
  return (await fn(tz)) as ComputeReturn;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Sécurité : clé secrète facultative (exigée si définie en prod)
  const provided = url.searchParams.get('key') || url.searchParams.get('secret');
  const secret = process.env.CRON_SECRET_64C || process.env.CRON_SECRET || '';
  const isProd = process.env.VERCEL === '1';
  if (secret && isProd && provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Paramètres
  const tz = url.searchParams.get('tz') || process.env.EVENTS_TZ || 'Europe/Paris';
  const at = url.searchParams.get('at') || url.searchParams.get('date') || undefined;

  // Calcul
  let data: ComputeReturn;
  try {
    data = await callCompute(tz, at);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'computeBirthdays failed', tz, at },
      { status: 500 }
    );
  }

  // Normalisation légère pour la date du jour
  const todayISO = data?.todayISO || data?.date;

  // Réponse JSON (⚠ pas de clé dupliquée)
  return NextResponse.json(
    {
      ok: true,
      tz,
      todayISO,
      ...data,
    },
    { status: 200 }
  );
}

// Méthodes non supportées
function methodNotAllowed(allow = 'GET') {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405, headers: { Allow: allow } }
  );
}
export const HEAD = GET;
export const OPTIONS = () => methodNotAllowed('GET, HEAD');
export const POST = () => methodNotAllowed();
export const PUT = () => methodNotAllowed();
export const PATCH = () => methodNotAllowed();
export const DELETE = () => methodNotAllowed();
