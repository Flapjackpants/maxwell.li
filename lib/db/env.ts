export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getDatabaseUrl(): string | undefined {
  return env("DATABASE_URL") ?? env("TURSO_DATABASE_URL");
}

export function getDatabaseAuthToken(): string | undefined {
  const token = env("DATABASE_AUTH_TOKEN") ?? env("TURSO_AUTH_TOKEN");
  if (!token) return undefined;
  return token.replace(/\s+/g, "");
}
