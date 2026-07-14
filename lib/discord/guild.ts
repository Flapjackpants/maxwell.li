import type { DiscordGuild } from "@/lib/auth/discord-oauth";

export function isGuildMember(guilds: DiscordGuild[], guildId: string): boolean {
  return guilds.some((g) => g.id === guildId);
}

export function getRequiredGuildId(): string {
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  if (!guildId) throw new Error("DISCORD_GUILD_ID is not set");
  return guildId;
}
