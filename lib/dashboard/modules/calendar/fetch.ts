export type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  htmlLink: string;
  location?: string;
};

export type CalendarPayload = {
  events: CalendarEvent[];
  error?: string;
};

export async function fetchCalendarData(
  accessToken: string | null,
): Promise<CalendarPayload> {
  if (!accessToken) {
    return { events: [], error: "Connect Google in settings" };
  }

  const now = new Date();
  const later = new Date(now.getTime() + 14 * 86400 * 1000);
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: later.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "12",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    const body = await res.text();
    return {
      events: [],
      error: `Calendar API error: ${res.status} ${body.slice(0, 120)}`,
    };
  }

  const data = (await res.json()) as {
    items?: {
      id: string;
      summary?: string;
      htmlLink?: string;
      location?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }[];
  };

  return {
    events: (data.items ?? []).map((e) => ({
      id: e.id,
      summary: e.summary ?? "(no title)",
      start: e.start?.dateTime ?? e.start?.date ?? "",
      end: e.end?.dateTime ?? e.end?.date ?? "",
      htmlLink: e.htmlLink ?? "https://calendar.google.com",
      location: e.location,
    })),
  };
}
