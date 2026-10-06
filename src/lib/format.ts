const integer = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function formatInteger(value: number): string {
  return integer.format(Math.round(value));
}

export function formatDecimal(value: number): string {
  return oneDecimal.format(value);
}

/** « 1 850 kcal » */
export function formatKcal(value: number): string {
  return `${formatInteger(value)} kcal`;
}

/** « 42 g » */
export function formatGrams(value: number): string {
  return `${formatInteger(value)} g`;
}

/** « 78,5 kg » */
export function formatKg(value: number): string {
  return `${formatDecimal(value)} kg`;
}

/** « 3 portions », « 1 portion » */
export function formatPortions(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${formatDecimal(rounded)} portion${Math.abs(rounded) >= 2 ? "s" : ""}`;
}

/** Signe explicite : « +250 », « −120 », « 0 » */
export function formatSigned(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${formatInteger(rounded)}`;
  if (rounded < 0) return `−${formatInteger(Math.abs(rounded))}`;
  return "0";
}

/** « 350 g » ou « 1,6 kg » au-delà d'un kilo. */
export function formatWeight(grams: number): string {
  if (grams >= 1000) return `${formatDecimal(Math.round(grams / 100) / 10)} kg`;
  return formatGrams(grams);
}
