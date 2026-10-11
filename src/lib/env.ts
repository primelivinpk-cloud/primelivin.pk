import { z } from "zod";

const envSchema = z.object({
  // Turso (libSQL)
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),

  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  BLOB_STORE_ID: z.string().optional(),
  BLOB_PK_STORE_ID: z.string().optional(),

  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_CURRENCY: z.string().default("PKR"),
  NEXT_PUBLIC_ENABLE_URDU: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

// Only validate on the server. Client code reads the NEXT_PUBLIC_ vars directly
// (they are inlined at build time).
const serverEnv = typeof window === "undefined"
  ? envSchema.safeParse(process.env)
  : null;

if (serverEnv && !serverEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    serverEnv.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables. Check your .env file.");
}

export const env = {
  // Server-only
  TURSO_DATABASE_URL: serverEnv?.data.TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN: serverEnv?.data.TURSO_AUTH_TOKEN,
  BLOB_READ_WRITE_TOKEN: serverEnv?.data.BLOB_READ_WRITE_TOKEN,
  BLOB_STORE_ID: serverEnv?.data.BLOB_STORE_ID,

  // Public (inlined)
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY ?? "PKR",
  NEXT_PUBLIC_ENABLE_URDU: process.env.NEXT_PUBLIC_ENABLE_URDU === "true",
};
