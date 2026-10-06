/**
 * Dates « métier » de Nutrian, au format ISO AAAA-MM-JJ, dans le fuseau de l'utilisateur.
 * Le serveur Render tourne en UTC : on fixe le fuseau pour que « aujourd'hui » soit juste.
 */
export const APP_TIME_ZONE = "Europe/Paris";

const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayIso(now: Date = new Date()): string {
  return isoFormatter.format(now);
}

export function currentYear(now: Date = new Date()): number {
  return Number(todayIso(now).slice(0, 4));
}

/** Ajoute (ou retire) des jours à une date ISO, sans souci de fuseau ni d'heure d'été. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Nombre de jours entre deux dates ISO (b − a). */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / msPerDay,
  );
}

/** Les `count` derniers jours, du plus ancien au plus récent, terminant par `endIso`. */
export function lastDays(endIso: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(endIso, index - count + 1));
}

const longLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const shortLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const weekdayLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "short", timeZone: "UTC" });

const toUtcNoon = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`);

/** « lundi 6 octobre » */
export function formatLongDate(isoDate: string): string {
  return longLabel.format(toUtcNoon(isoDate));
}

/** « lun. 6 oct. » */
export function formatShortDate(isoDate: string): string {
  return shortLabel.format(toUtcNoon(isoDate));
}

/** « lun. » */
export function formatWeekday(isoDate: string): string {
  return weekdayLabel.format(toUtcNoon(isoDate));
}

/** « Aujourd'hui », « Hier » ou la date courte. */
export function formatRelativeDay(isoDate: string, today: string = todayIso()): string {
  const diff = daysBetween(isoDate, today);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return formatShortDate(isoDate);
}
