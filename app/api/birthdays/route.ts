import { NextRequest, NextResponse } from 'next/server';
import { computeBirthdays } from '@/lib/birthdays';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const tz = process.env.EVENTS_TZ || 'Europe/Paris';
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date'); // ex: 2025-10-21
  const now = dateParam ? new Date(`${dateParam}T12:00:00Z`) : new Date();
  const data = computeBirthdays(tz, now);
  return NextResponse.json({ ok: true, ...data });
}
