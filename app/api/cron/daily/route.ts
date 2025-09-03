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

// Clé attendue (plusieurs noms supportés)
function expectedSecret(): string | undefined {
  return (
    process.env.CRON_SECRET_64C ||
    process.env.CRON_SECRET ||
    process.env.CRON_KEY ||
    // @ts-ignore
    (process.env as any)?.cron_key
  );
}

// Clé fournie via query ou header
function providedSecret(req: NextRequest): string | null {
  const u = new URL(req.url);
  return (
    u.searchParams.get('key') ||
    u.searchParams.get('secret') ||
    req.headers.get('x-cron-key') ||
    null
  );
}

// minutes-window autour de HH:MM dans un fuseau donné
function isRunWindow(tz: string, targetHour = 7, targetMinute = 30, windowMin = 2) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const cur = h * 60 + m;
  const tgt = targetHour * 60 + targetMinute;
  const diff = cur - tgt; // minutes
  return diff >= 0 && diff < windowMin;
}

// parse JJ -> DateUTC
function dateFromISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}
const ONE_DAY = 24 * 60 * 60 * 1000;
function diffDaysISO(aISO: string, bISO: string) {
  return Math.round((dateFromISO(bISO).getTime() - dateFromISO(aISO).getTime()) / ONE_DAY);
}

// Charge et appelle computeBirthdays (plusieurs signatures possibles)
async function computeAll(tz: string, at?: string): Promise<ComputeReturn> {
  const lib = await import('@/lib/birthdays').catch(() => null as any);
  if (!lib) throw new Error('Module "@/lib/birthdays" introuvable');
  const fn: any = lib.computeBirthdays || lib.getBirthdays || lib.default;
  if (!fn) throw new Error('Aucune fonction computeBirthdays trouvée');

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

// Envoi email (sujet + texte)
async function sendEmail(subject: string, text: string) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM,
    EMAIL_TO,
    ENABLE_EMAIL,
  } = process.env;

  const enabled =
    ENABLE_EMAIL === '1' ||
    Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_FROM && EMAIL_TO);
  if (!enabled) return { sent: false, reason: 'SMTP non configuré' };

  const nodemailer = (await import('nodemailer')).default;
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM!,
      to: EMAIL_TO!,
      subject,
      text,
    });
    return { sent: true, messageId: info.messageId };
  } catch (e: any) {
    return { sent: false, error: String(e?.message || e) };
  }
}

function formatList(items: { name: string; age?: number; years?: number }[]) {
  return items
    .map((p) => {
      const age = p.age != null ? ` (${p.age} an${p.age > 1 ? 's' : ''})` : '';
      const yrs = p.years != null ? ` (${p.years} an${p.years > 1 ? 's' : ''})` : '';
      return `• ${p.name}${age || yrs}`;
    })
    .join('\n');
}

/* ---------- Handler ---------- */

export async function GET(req: NextRequest) {
  // Auth
  const expected = expectedSecret();
  const got = providedSecret(req);
  if (expected && got !== expected) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: bad or missing cron key' },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const dateOverride = url.searchParams.get('date') || undefined;
  const force = url.searchParams.get('force') === '1';
  const tz = process.env.EVENTS_TZ || 'Europe/Paris';

  // Fenêtre 07:30 (±2 min) — sauf si ?force=1
  const inWindow = isRunWindow(tz, 7, 30, 2);
  if (!force && !inWindow) {
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
    return NextResponse.json(
      { ok: false, error: 'computeBirthdays failed', details: String(e?.message || e) },
      { status: 500 }
    );
  }

  // Normalisation
  const todayISO = data?.todayISO || dateOverride || new Date().toISOString().slice(0, 10);
  const birthdaysToday = Array.isArray(data?.birthdaysToday) ? data.birthdaysToday : [];
  const memorialsToday = Array.isArray(data?.memorialsToday) ? data.memorialsToday : [];
  const upcomingIn7Days = Array.isArray(data?.upcomingIn7Days) ? data.upcomingIn7Days : [];
  const memorialsUpcomingIn7Days = Array.isArray(data?.memorialsUpcomingIn7Days)
    ? data.memorialsUpcomingIn7Days
    : [];

  // Sélection J, J-1, J-2 (fallback via dateISO si inDays absent)
  const pickBy = (n: 0 | 1 | 2) => (it: any) => {
    if (typeof it?.inDays === 'number') return it.inDays === n;
    if (it?.dateISO) return diffDaysISO(todayISO, it.dateISO) === n;
    return false;
  };

  const bJ  = birthdaysToday;
  const mJ  = memorialsToday;
  const bJ1 = upcomingIn7Days.filter(pickBy(1));
  const bJ2 = upcomingIn7Days.filter(pickBy(2));
  const mJ1 = memorialsUpcomingIn7Days.filter(pickBy(1));
  const mJ2 = memorialsUpcomingIn7Days.filter(pickBy(2));

  const anyReminder = bJ.length || mJ.length || bJ1.length || bJ2.length || mJ1.length || mJ2.length;

  // S'il n'y a aucun rappel J/J-1/J-2 → pas d'email
  if (!anyReminder) {
    const { tz: _tz2, todayISO: _d2, ...rest } = data || {};
    return NextResponse.json({
      ok: true,
      tz,
      todayISO,
      skipped: true,
      reason: 'no-reminders-(J,J-1,J-2)',
      ...rest,
      reminders: { bJ, mJ, bJ1, bJ2, mJ1, mJ2 },
    });
  }

  // Contenu email
  const badges: string[] = [];
  if (bJ.length || mJ.length) badges.push("AUJOURD'HUI");
  if (bJ1.length || mJ1.length) badges.push('J-1');
  if (bJ2.length || mJ2.length) badges.push('J-2');

  const subject = `${badges.join(' + ')} — ${todayISO} (${tz})`;

  const lines: string[] = [`Date: ${todayISO} (${tz})`, ''];
  if (bJ.length || mJ.length) {
    lines.push("🎉 AUJOURD'HUI — Anniversaires:", bJ.length ? formatList(bJ) : '—', '');
    lines.push('✝️ AUJOURD’HUI — Souvenirs:', mJ.length ? formatList(mJ as any) : '—', '');
    lines.push('');
  }
  if (bJ1.length || mJ1.length) {
    lines.push('⏰ DEMAIN (J-1) — Anniversaires:', bJ1.length ? formatList(bJ1) : '—', '');
    lines.push('⏰ DEMAIN (J-1) — Souvenirs:', mJ1.length ? formatList(mJ1 as any) : '—', '');
    lines.push('');
  }
  if (bJ2.length || mJ2.length) {
    lines.push('🗓️ Dans 2 jours (J-2) — Anniversaires:', bJ2.length ? formatList(bJ2) : '—', '');
    lines.push('🗓️ Dans 2 jours (J-2) — Souvenirs:', mJ2.length ? formatList(mJ2 as any) : '—', '');
    lines.push('');
  }
  lines.push('—', 'Cet email est généré automatiquement par le cron.');

  const emailResult = await sendEmail(subject, lines.join('\n'));

  const { tz: _tz3, todayISO: _d3, ...rest } = data || {};
  return NextResponse.json({
    ok: true,
    tz,
    todayISO,
    emailResult,
    ...rest,
    reminders: { bJ, mJ, bJ1, bJ2, mJ1, mJ2 },
  });
}

export const POST = GET;
