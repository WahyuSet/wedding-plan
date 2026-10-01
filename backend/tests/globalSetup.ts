import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

export default function setup(): void {
  const dbFile = path.resolve(__dirname, "../prisma/test.db");
  for (const f of [dbFile, `${dbFile}-journal`]) {
    if (existsSync(f)) rmSync(f);
  }
  const uploads = path.resolve(__dirname, ".uploads");
  if (existsSync(uploads)) rmSync(uploads, { recursive: true, force: true });
  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "pipe",
  });
}
