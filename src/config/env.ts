import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid URL"),
  JWT_SECRET: z
    .string()
    .min(8, "JWT_SECRET must be at least 8 characters long"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

export type Env = z.infer<typeof envSchema>;
