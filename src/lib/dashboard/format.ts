/** Pure, unit-testable relative time formatter in Indonesian. */
export function formatRelativeTime(isoDate: string, now: Date = new Date()): string {
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hari lalu`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} bulan lalu`;
}
