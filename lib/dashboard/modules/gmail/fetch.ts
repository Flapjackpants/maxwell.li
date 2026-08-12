export type GmailMessage = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
};

export type GmailPayload = {
  messages: GmailMessage[];
  error?: string;
};

function header(
  headers: { name: string; value: string }[],
  name: string,
): string {
  return (
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ??
    ""
  );
}

export async function fetchGmailData(
  accessToken: string | null,
): Promise<GmailPayload> {
  if (!accessToken) {
    return { messages: [], error: "Connect Google in settings" };
  }

  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&labelIds=INBOX",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!listRes.ok) {
    const body = await listRes.text();
    return {
      messages: [],
      error: `Gmail API error: ${listRes.status} ${body.slice(0, 120)}`,
    };
  }

  const list = (await listRes.json()) as {
    messages?: { id: string; threadId: string }[];
  };
  const ids = list.messages ?? [];
  const messages: GmailMessage[] = [];

  for (const m of ids) {
    const detailRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!detailRes.ok) continue;
    const detail = (await detailRes.json()) as {
      id: string;
      threadId: string;
      snippet?: string;
      payload?: { headers?: { name: string; value: string }[] };
    };
    const headers = detail.payload?.headers ?? [];
    messages.push({
      id: detail.id,
      threadId: detail.threadId,
      subject: header(headers, "Subject") || "(no subject)",
      from: header(headers, "From"),
      snippet: detail.snippet ?? "",
      date: header(headers, "Date"),
    });
  }

  return { messages };
}
