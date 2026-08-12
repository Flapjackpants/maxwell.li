export type YoutubeStatsPayload = {
  channelTitle: string | null;
  subscriberCount: string | null;
  viewCount: string | null;
  videoCount: string | null;
  error?: string;
};

export async function fetchYoutubeData(
  accessToken: string | null,
): Promise<YoutubeStatsPayload> {
  if (!accessToken) {
    return {
      channelTitle: null,
      subscriberCount: null,
      viewCount: null,
      videoCount: null,
      error: "Connect Google in settings",
    };
  }

  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!channelRes.ok) {
    const body = await channelRes.text();
    return {
      channelTitle: null,
      subscriberCount: null,
      viewCount: null,
      videoCount: null,
      error: `YouTube API error: ${channelRes.status} ${body.slice(0, 120)}`,
    };
  }

  const data = (await channelRes.json()) as {
    items?: {
      snippet?: { title?: string };
      statistics?: {
        subscriberCount?: string;
        viewCount?: string;
        videoCount?: string;
      };
    }[];
  };

  const channel = data.items?.[0];
  if (!channel) {
    return {
      channelTitle: null,
      subscriberCount: null,
      viewCount: null,
      videoCount: null,
      error: "No YouTube channel found for this Google account",
    };
  }

  return {
    channelTitle: channel.snippet?.title ?? null,
    subscriberCount: channel.statistics?.subscriberCount ?? null,
    viewCount: channel.statistics?.viewCount ?? null,
    videoCount: channel.statistics?.videoCount ?? null,
  };
}
