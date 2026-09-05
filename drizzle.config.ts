import { defineConfig } from "drizzle-kit";

if (!Bun.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  out: "./infrastructure/drizzle/drizzle-output",
  schema: "./infrastructure/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: Bun.env.DATABASE_URL,
  },
  schemaFilter: ["public"],
});
