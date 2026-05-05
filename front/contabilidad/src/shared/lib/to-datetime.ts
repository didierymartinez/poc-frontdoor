/** Converts DD/MM/YYYY to ISO datetime string (YYYY-MM-DDT00:00:00) */
export function toDatetime(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}-${m}-${d}T00:00:00`;
}
