export type StockRange = "day" | "month" | "year" | "all";

export type StockQuote = {
  symbol: string;
  price: number;
  changePercent: number;
  range: StockRange;
};

export type StocksPayload = {
  range: StockRange;
  quotes: StockQuote[];
  error?: string;
};

function parseTickers(config: Record<string, string>): string[] {
  const raw = config.tickers ?? "";
  return raw
    .split(/[\s,]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20);
}

function rangeToFrom(range: StockRange, nowSec: number): number {
  const day = 86400;
  switch (range) {
    case "day":
      return nowSec - day;
    case "month":
      return nowSec - 30 * day;
    case "year":
      return nowSec - 365 * day;
    case "all":
      return nowSec - 3650 * day;
  }
}

async function finnhubQuote(
  symbol: string,
  token: string,
): Promise<{ c: number; dp: number } | null> {
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { c?: number; dp?: number };
  if (typeof data.c !== "number" || data.c === 0) return null;
  return { c: data.c, dp: typeof data.dp === "number" ? data.dp : 0 };
}

async function finnhubChangeForRange(
  symbol: string,
  token: string,
  range: StockRange,
  currentPrice: number,
): Promise<number> {
  if (range === "day") {
    const q = await finnhubQuote(symbol, token);
    return q?.dp ?? 0;
  }

  const now = Math.floor(Date.now() / 1000);
  const from = rangeToFrom(range, now);
  const res = await fetch(
    `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${now}&token=${encodeURIComponent(token)}`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) return 0;
  const data = (await res.json()) as { s?: string; c?: number[] };
  if (data.s !== "ok" || !data.c?.length) return 0;
  const first = data.c[0]!;
  if (!first) return 0;
  return ((currentPrice - first) / first) * 100;
}

export async function fetchStocksData(
  config: Record<string, string>,
  range: StockRange = "day",
): Promise<StocksPayload> {
  const token = process.env.FINNHUB_API_KEY?.trim();
  const tickers = parseTickers(config);

  if (!token) {
    return {
      range,
      quotes: [],
      error: "FINNHUB_API_KEY is not configured",
    };
  }
  if (tickers.length === 0) {
    return {
      range,
      quotes: [],
      error: "Add tickers in dashboard settings",
    };
  }

  const quotes: StockQuote[] = [];
  for (const symbol of tickers) {
    const q = await finnhubQuote(symbol, token);
    if (!q) continue;
    const changePercent =
      range === "day"
        ? q.dp
        : await finnhubChangeForRange(symbol, token, range, q.c);
    quotes.push({
      symbol,
      price: q.c,
      changePercent,
      range,
    });
  }

  return { range, quotes };
}
