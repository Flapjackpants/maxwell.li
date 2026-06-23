export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getDatabaseEnvDiagnostics } = await import("@/lib/db/env");
  console.log("[db] env check:", getDatabaseEnvDiagnostics());

  const { runMigrations } = await import("@/lib/db/migrate");
  await runMigrations();
}
