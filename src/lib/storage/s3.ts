import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

const isDevelopment = process.env.NODE_ENV === "development";

export const s3Client = new S3Client({
  region: env.STORAGE_REGION,

  ...(isDevelopment && {
    endpoint: env.STORAGE_ENDPOINT,
    forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
  }),

  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
  },
  forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
});
