// app/api/cron/daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { computeBirthdays } from '@/lib/birthdays';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const keyFromQuery = new URL(req.url).searchParams.get('key'); // pour tests manuels
  if (!expected) return false;
  return auth === `Bearer ${expected}` || keyFromQuery === expected;
}

// ⏰ n'exécuter que si l'heure locale = 07:30 Europe/Paris
function isAtLocal0730(tz = 'Europe/Paris') {
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date());
  const h = Number(parts.find(p => p.type === 'hour')!.value);
  const m = Number(parts.find(p => p.type === 'minute')!.value);
  return h === 7 && m === 30;
}

async function sendEmail(subject: string, html: string, text: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;
  const to = process.env.EMAIL_TO;

  if (!host || !user || !pass || !from || !to) {
    console.warn('Email désactivé: variables SMTP manquantes');
    return { sent: false, reason: 'missing_smtp_env' };
  }

  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass } // <= mot de passe d'application Gmail (16 caractères)
  });

  await transporter.sendMail({ from, to, subject, text, html });
  return { sent: true };
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return new NextResponse('Unauthorized', { status: 401 });

  const tz = process.env.EVENTS_TZ || 'Europe/Paris';
  if (!isAtLocal0730(tz)) {
    return NextResponse.json({ ok: true, skipped: 'not-07:30-local' });
  }

  const data = computeBirthdays(tz);

  const subjectBits: string[] = [];
  const text: string[] = [];
  const html: string[] = [];

  if (data.birthdaysToday.length > 0) {
    subjectBits.push('🎂');
    text.push('Anniversaire(s) aujourd’hui :');
    html.push('<p><strong>Anniversaire(s) aujourd’hui :</strong></p><ul>');
    data.birthdaysToday.forEach((b: any) => {
      const line = `• ${b.name}${b.age !== undefined ? ` — ${b.age} ans` : ''}`;
      text.push(line);
      html.push(`<li>${b.name}${b.age !== undefined ? ` — ${b.age} ans` : ''}</li>`);
    });
    html.push('</ul>');
  }

  if (data.memorialsToday.length > 0) {
    subjectBits.push('✝️');
    text.push('Souvenir (anniversaire de décès) :');
    html.push('<p><strong>Souvenir (anniversaire de décès) :</strong></p><ul>');
    data.memorialsToday.forEach((m: any) => {
      const line = `• ${m.name}${m.years !== undefined ? ` — ${m.years} an(s)` : ''}`;
      text.push(line);
      html.push(`<li>${m.name}${m.years !== undefined ? ` — ${m.years} an(s)` : ''}</li>`);
    });
    html.push('</ul>');
  }

  let emailResult: any = { sent: false };
  if (subjectBits.length > 0) {
    const titleDate = new Date().toLocaleDateString('fr-FR', { timeZone: tz, day: '2-digit', month: 'long' });
    const subject = `${subjectBits.join(' ')} — ${titleDate}`;
    emailResult = await sendEmail(subject, html.join('\n'), text.join('\n'));
  }

  return NextResponse.json({ ok: true, tz, todayISO: data.todayISO, ...data, emailResult });
}
