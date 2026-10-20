const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompact(n: number): string {
  return compact.format(n);
}

export function formatDuration(sec: number): string {
  const total = Math.round(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

export function formatPercent(p: number, digits = 1): string {
  const fixed = p.toFixed(digits);
  const trimmed = fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
  return `${trimmed}%`;
}

export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  return `${month} ${String(y).slice(2)}`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
