export type CanvasAssignment = {
  id: number;
  name: string;
  courseName: string;
  dueAt: string | null;
  htmlUrl: string;
  pointsPossible: number | null;
};

export type CanvasPayload = {
  assignments: CanvasAssignment[];
  error?: string;
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export async function fetchCanvasData(
  accessToken: string | null,
  config: Record<string, string>,
): Promise<CanvasPayload> {
  const base =
    config.baseUrl?.trim() ||
    (accessToken
      ? "" // token row may store base in meta; caller passes via config
      : "");
  const token = accessToken;
  const canvasBase = normalizeBaseUrl(base || config.baseUrl || "");

  if (!token || !canvasBase) {
    return {
      assignments: [],
      error: "Add Canvas base URL and connect with an API token in settings",
    };
  }

  const res = await fetch(
    `${canvasBase}/api/v1/users/self/todo?per_page=20`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    return {
      assignments: [],
      error: `Canvas API error: ${res.status} ${body.slice(0, 120)}`,
    };
  }

  const data = (await res.json()) as {
    assignment?: {
      id: number;
      name: string;
      html_url?: string;
      points_possible?: number;
      due_at?: string | null;
    };
    context_name?: string;
    type?: string;
  }[];

  const assignments: CanvasAssignment[] = [];
  for (const item of data) {
    if (item.type !== "submitting" && !item.assignment) continue;
    const a = item.assignment;
    if (!a) continue;
    assignments.push({
      id: a.id,
      name: a.name,
      courseName: item.context_name ?? "Course",
      dueAt: a.due_at ?? null,
      htmlUrl: a.html_url ?? canvasBase,
      pointsPossible: a.points_possible ?? null,
    });
  }

  assignments.sort((a, b) => {
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  return { assignments };
}
