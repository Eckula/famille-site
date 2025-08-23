// app/api/cron/daily/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';

type BirthdayItem = { name: string; age?: number; dateISO?: string; inDays?: number };
type MemorialItem = { name: string; years?: number; dateISO?: string; inDays?: number };
type ComputeReturn = {
  tz?: string;
  todayISO?: string;
  birthdaysToday?: BirthdayItem[];
  memorialsToday?: MemorialItem[];
  upcomingIn7Days?: BirthdayItem[];
  memorialsUpcomingIn7Days?: MemorialItem[];
  [k: string]: any;
};

/* ---------- Helpers ---------- */

// Clé attendue (supporte CRON_SECRET, CRON_KEY ou cron_key)
function expectedSecret(): string | undefined {
  return (
    process.env.CRON_SECRET ||
    process.env.CRON_KEY ||
    // @ts-ignore
    (process.env as any)?.cron_key
  );
}

// Clé fournie
function providedSecret(req: NextRequest): string | null {
  const u = new URL(req.url);
  return (
    u.searchParams.get('key') ||
    u.searchParams.get('secret') ||
    req.headers.get('x-cron-key') ||
    null
  );
}

// Test "est-ce 07:30 (±windowMin) dans le fuseau donné ?"
function isRunWindow(tz: string, targetHour = 7, targetMinute = 30, windowMin = 2) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
  const parts = fmt.formatToParts(now);
  const h = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
  const cur = h * 60 + m;
  const tgt = targetHour * 60 + targetMinute;
  const diff = cur - tgt; // minutes
  return diff >= 0 && diff < windowMin;
}

// Charge computeBirthdays avec compat
async function computeAll(tz: string, at?: string): Promise{ComputeReturn} {
  const lib = await import('@/lib/birthdays').catch(() => null as any);
  if (!lib) throw new Error('Module "@/lib/birthdays" introuvable');
  const fn: any = lib.computeBirthdays || lib.getBirthdays || lib.default;
  if (!fn) throw new Error('Aucune fonction computeBirthdays trouvée');

  if (at) {
    try { return (await fn(tz, { at, horizonDays: 7 })) as ComputeReturn; } catch {}
    try { return (await fn(tz, at)) as ComputeReturn; } catch {}
  }
  try { return (await fn(tz, { horizonDays: 7 })) as ComputeReturn; } catch {}
  return (await fn(tz)) as ComputeReturn;
}

// Email SMTP si configuré
async function sendEmailIfConfigured(payload: {
  tz: string; todayISO: string;
  birthdaysToday: BirthdayItem[]; memorialsToday: MemorialItem[];
  upcomingIn7Days: BirthdayItem[]; memorialsUpcomingIn7Days: MemorialItem[];
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, EMAIL_TO, ENABLE_EMAIL } = process.env;
  const wantEmail = ENABLE_EMAIL === '1' || Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_FROM && EMAIL_TO);
  if (!wantEmail) return { sent: false, reason: 'SMTP non configuré' };

  const nodemailer = (await import('nodemailer')).default;
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const title: string[] = [];
  if (payload.birthdaysToday.length) title.push('🎉 Anniversaires');
  if (payload.memorialsToday.length) title.push('✝️ Souvenirs');
  const subject = `${title.join(' + ') || 'Rappel quotidien'} — ${payload.todayISO} (${payload.tz})`;

  const list = (items: { name: string; age?: number; years?: number }[]) =>
    items.map(p => `• ${p.name}${p.age!=null?` (${p.age} an${p.age>1?'s':''})`:p.years!=null?` (${p.years} an${p.years>1?'s':''})`:''}`).join('\n');

  const text = [
    `Date: ${payload.todayISO} (${payload.tz})`,
    '', '🎉 Anniversaires aujourd’hui:', payload.birthdaysToday.length ? list(payload.birthdaysToday) : '—',
    '', '✝️ Souvenirs aujourd’hui:', payload.memorialsToday.length ? list(payload.memorialsToday as any) : '—',
    '', 'À venir (7 jours) — Anniversaires:', payload.upcomingIn7Days.length ? list(payload.upcomingIn7Days) : '—',
    '', 'À venir (7 jours) — Souvenirs:', payload.memorialsUpcomingIn7Days.length ? list(payload.memorialsUpcomingIn7Days as any) : '—',
    '', '—', 'Cet email est généré automatiquement par le cron.',
  ].join('\n');

  try {
    const info = await transporter.sendMail({ from: EMAIL_FROM!, to: EMAIL_TO!, subject, text });
    return { sent: true, messageId: info.messageId };
  } catch (e: any) {
    return { sent: false, error: String(e?.message || e) };
  }
}

/* ---------- Handler ---------- */

export async function GET(req: NextRequest) {
  // Auth
  const expected = expectedSecret();
  const got = providedSecret(req);
  if (!expected || got !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized: bad or missing cron key' }, { status: 401 });
  }

  const url = new URL(req.url);
  const dateOverride = url.searchParams.get('date') || undefined;
  const force = url.searchParams.get('force') === '1'; // force l’exécution (test)

  const tz = process.env.EVENTS_TZ || 'Europe/Paris';

  // Fenêtre 07:30 Europe/Paris (±2 min) — sauf si ?force=1
  const inWindow = isRunWindow(tz, 7, 30, 2);
  if (!force && !inWindow) {
    // On calcule quand même les données pour que tu voies les “today/upcoming” dans la réponse
    const data = await computeAll(tz, dateOverride);
    const todayISO = data?.todayISO || dateOverride || new Date().toISOString().slice(0, 10);
    const { tz: _tzIgnore, todayISO: _todayIgnore, ...rest } = data || {};
    return NextResponse.json({
      ok: true,
      tz,
      todayISO,
      skipped: true,
      reason: 'outside-run-window',
      ...rest,
    });
  }

  // Calcul
  let data: ComputeReturn;
  try {
    data = await computeAll(tz, dateOverride);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'computeBirthdays failed', details: String(e?.message || e) }, { status: 500 });
  }

  // Normalisation
  const todayISO = data?.todayISO || dateOverride || new Date().toISOString().slice(0, 10);
  const birthdaysToday = Array.isArray(data?.birthdaysToday) ? data.birthdaysToday : [];
  const memorialsToday = Array.isArray(data?.memorialsToday) ? data.memorialsToday : [];
  const upcomingIn7Days = Array.isArray(data?.upcomingIn7Days) ? data.upcomingIn7Days : [];
  const memorialsUpcomingIn7Days = Array.isArray(data?.memorialsUpcomingIn7Days) ? data.memorialsUpcomingIn7Days : [];

  // Email
  const emailResult = await sendEmailIfConfigured({
    tz, todayISO, birthdaysToday, memorialsToday, upcomingIn7Days, memorialsUpcomingIn7Days,
  });

  // Réponse (sans doublon)
  const { tz: _tz2, todayISO: _d2, ...rest } = data || {};
  return NextResponse.json({
    ok: true,
    tz,
    todayISO,
    birthdaysToday,
    memorialsToday,
    upcomingIn7Days,
    memorialsUpcomingIn7Days,
    emailResult,
    ...rest,
  });
}

export const POST = GET;
