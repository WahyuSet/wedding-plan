import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET wajib diisi"),
  CORS_ORIGIN: z.string().optional(),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  API_PUBLIC_URL: z.string().url().optional(),
  UPLOAD_DIR: z.string().default("./uploads"),
  COOKIE_DOMAIN: z.string().optional(),
  // Origin domain undangan yang dilayani backend ini. Kosong = undangan tetap di FRONTEND_URL/invitation.
  INVITATION_URL: z
    .string()
    .url()
    .refine((v) => /^https?:\/\/[^/?#]+\/?$/.test(v), "hanya origin, tanpa path (mis. https://undangan.com)")
    .optional(),
  // Folder build frontend (berisi index.html) yang disajikan di domain undangan.
  INVITATION_DIST_DIR: z.string().default("../frontend/dist"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`Konfigurasi environment tidak valid:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;

if (env.NODE_ENV === "production" && env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET minimal 32 karakter di production.");
  process.exit(1);
}

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

// Domain undangan dibedakan dari header Host, jadi hostname-nya tidak boleh sama dengan dashboard atau API.
if (env.INVITATION_URL) {
  const invitationHost = new URL(env.INVITATION_URL).hostname;
  const clashes = [
    ["FRONTEND_URL", env.FRONTEND_URL],
    ["API_PUBLIC_URL", env.API_PUBLIC_URL],
  ].filter(([, url]) => url && new URL(url).hostname === invitationHost);
  if (clashes.length) {
    console.error(`INVITATION_URL harus memakai hostname yang berbeda dari ${clashes.map(([name]) => name).join(" dan ")}.`);
    process.exit(1);
  }
}
