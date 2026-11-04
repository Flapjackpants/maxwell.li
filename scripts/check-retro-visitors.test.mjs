import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = path.resolve(import.meta.dirname, "..");
const endpoint = "/api/retro/visitors";

function databaseEnv(databasePath) {
  return {
    ...process.env,
    DATABASE_URL: `file:${databasePath}`,
    DATABASE_AUTH_TOKEN: "",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
  };
}

async function withServer(databasePath, port, run) {
  const server = spawn("node_modules/.bin/next", ["start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: root,
    env: databaseEnv(databasePath),
    stdio: "ignore",
  });
  const url = `http://127.0.0.1:${port}${endpoint}`;

  try {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      if (server.exitCode !== null) throw new Error(`next start exited with ${server.exitCode}`);
      try {
        await fetch(`http://127.0.0.1:${port}/`);
        break;
      } catch {
        await delay(100);
      }
    }
    if (Date.now() >= deadline) throw new Error(`next start did not answer on port ${port}`);
    await run(url);
  } finally {
    if (server.exitCode === null) {
      server.kill();
      await new Promise((resolve) => server.once("exit", resolve));
    }
  }
}

test("retro visitor POST counts once per cookie and reports database errors", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "retro-visitors-test-"));
  const migratedPath = path.join(directory, "migrated.db");
  const unmigratedPath = path.join(directory, "unmigrated.db");

  try {
    const migration = spawnSync(process.execPath, ["scripts/migrate.mjs"], {
      cwd: root,
      env: databaseEnv(migratedPath),
      encoding: "utf8",
    });
    assert.equal(migration.status, 0, migration.stderr || migration.stdout);

    await withServer(migratedPath, 3457, async (url) => {
      const first = await fetch(url, { method: "POST" });
      assert.equal(first.status, 200);
      assert.deepEqual(await first.json(), { count: 1 });
      assert.match(first.headers.get("set-cookie") ?? "", /retro_visited=1/);
      assert.match(first.headers.get("set-cookie") ?? "", /Max-Age=31536000/i);
      assert.match(first.headers.get("set-cookie") ?? "", /HttpOnly/i);

      const repeat = await fetch(url, { method: "POST", headers: { Cookie: "retro_visited=1" } });
      assert.equal(repeat.status, 200);
      assert.deepEqual(await repeat.json(), { count: 1 });
      assert.equal(repeat.headers.get("set-cookie"), null);

      const second = await fetch(url, { method: "POST" });
      assert.equal(second.status, 200);
      assert.deepEqual(await second.json(), { count: 2 });

      const retro = await fetch(new URL("/retro", url));
      assert.equal(retro.status, 200);
      const html = await retro.text();
      assert.ok(html.includes("You are visitor number"));
      assert.ok(html.includes("???????"));
      assert.ok(!html.includes("visitor number 0000071"));
    });

    await withServer(unmigratedPath, 3458, async (url) => {
      const response = await fetch(url, { method: "POST" });
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: "Visitor count unavailable" });
      assert.equal(response.headers.get("set-cookie"), null);
    });
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
