import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

// Load .env so drizzle-kit can read TURSO_* vars
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "turso",
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  strict: true,
  verbose: true,
});
