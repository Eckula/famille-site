// lib/birthdays.ts
export type Birthday = {
  name: string;
  month: number; day: number; year?: number;
  deceased?: boolean;
  deathMonth?: number; deathDay?: number; deathYear?: number;
  email?: string;
};

function getLocalDateParts(tz: string, d = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const [y, m, dd] = fmt.format(d).split('-').map(Number);
  return { y, m, d: dd };
}
function addDays(date: Date, days: number) { const d = new Date(date); d.setUTCDate(d.getUTCDate() + days); return d; }

function readBirthdays(): Birthday[] {
  const raw = process.env.BIRTHDAYS_JSON;
  if (!raw) return [];
  try { return JSON.parse(raw) as Birthday[]; } catch { return []; }
}

function ageOn(birthYear: number | undefined, targetY: number, targetM: number, targetD: number, bM: number, bD: number) {
  if (!birthYear) return undefined;
  let age = targetY - birthYear;
  if (targetM < bM || (targetM === bM && targetD < bD)) age -= 1;
  return age;
}
function yearsSince(deathYear: number | undefined, targetY: number, targetM: number, targetD: number, dM: number, dD: number) {
  if (!deathYear) return undefined;
  let yrs = targetY - deathYear;
  if (targetM < dM || (targetM === dM && targetD < dD)) yrs -= 1;
  return yrs;
}

export function computeBirthdays(tz = 'Europe/Paris', now: Date = new Date()) {
  const includeDeathAnns = (process.env.INCLUDE_DEATH_ANNIVERSARIES ?? 'true') === 'true';
  const includeDeceasedBirthdays = (process.env.INCLUDE_DECEASED_BIRTHDAYS ?? 'false') === 'true';

  const list = readBirthdays();
  const { y, m, d } = getLocalDateParts(tz, now);

  const todayKey = `${m}-${d}`;
  const next7: { key: string; date: Date }[] = Array.from({ length: 7 }, (_, i) => {
    const dt = addDays(now, i + 1);
    const parts = getLocalDateParts(tz, dt);
    return { key: `${parts.m}-${parts.d}`, date: dt };
  });

  const birthdaysToday = list
    .filter(b => (!b.deceased || includeDeceasedBirthdays))
    .filter(b => `${b.month}-${b.day}` === todayKey)
    .map(b => ({ name: b.name, month: b.month, day: b.day, age: ageOn(b.year, y, m, d, b.month, b.day), deceased: !!b.deceased }));

  const upcomingIn7Days = list
    .filter(b => (!b.deceased || includeDeceasedBirthdays))
    .filter(b => next7.some(n => n.key === `${b.month}-${b.day}`))
    .map(b => {
      const target = next7.find(n => n.key === `${b.month}-${b.day}`)!.date;
      const parts = getLocalDateParts(tz, target);
      return {
        name: b.name, month: b.month, day: b.day,
        inDays: Math.ceil((target.getTime() - now.getTime()) / (24 * 3600 * 1000)),
        age: ageOn(b.year, parts.y, parts.m, parts.d, b.month, b.day),
        deceased: !!b.deceased
      };
    })
    .sort((a, b) => a.inDays - b.inDays);

  const memorialsToday = includeDeathAnns ? list
    .filter(b => b.deceased && b.deathMonth && b.deathDay)
    .filter(b => `${b.deathMonth}-${b.deathDay}` === todayKey)
    .map(b => ({ name: b.name, deathMonth: b.deathMonth!, deathDay: b.deathDay!, years: yearsSince(b.deathYear, y, m, d, b.deathMonth!, b.deathDay!) })) : [];

  const memorialsIn7Days = includeDeathAnns ? list
    .filter(b => b.deceased && b.deathMonth && b.deathDay)
    .filter(b => next7.some(n => n.key === `${b.deathMonth}-${b.deathDay}`))
    .map(b => {
      const target = next7.find(n => n.key === `${b.deathMonth}-${b.deathDay}`)!.date;
      const parts = getLocalDateParts(tz, target);
      return {
        name: b.name, deathMonth: b.deathMonth!, deathDay: b.deathDay!,
        inDays: Math.ceil((target.getTime() - now.getTime()) / (24 * 3600 * 1000)),
        years: yearsSince(b.deathYear, parts.y, parts.m, parts.d, b.deathMonth!, b.deathDay!)
      };
    })
    .sort((a, b) => a.inDays - b.inDays) : [];

  return {
    tz,
    todayISO: new Intl.DateTimeFormat('en-CA', { timeZone: tz, dateStyle: 'short' }).format(now),
    birthdaysToday, upcomingIn7Days,
    memorialsToday, memorialsIn7Days
  };
}
