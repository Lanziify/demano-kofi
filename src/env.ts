import z from 'zod';

export const envSchema = z.object({
  //Database
  DATABASE_URL: z.string(),
  // Redis
  REDIS_URL: z.string(),
  // Storage
  STORAGE_ENDPOINT: z.string(),
  STORAGE_REGION: z.string(),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_ACCESS_KEY_ID: z.string(),
  STORAGE_SECRET_ACCESS_KEY: z.string(),
  STORAGE_FORCE_PATH_STYLE: z.coerce.boolean(),
});

export const env = envSchema.parse(process.env);
