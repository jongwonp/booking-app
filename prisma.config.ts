import "dotenv/config"; // .env 먼저 로드(안전)
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
