import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '@/env';
import { s3Client } from './s3';

const bucket = env.STORAGE_BUCKET;

export async function uploadObject({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
}) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function deleteObject(key: string) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function getObject(key: string) {
  return s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export function getPublicUrl(key: string) {
  const endpoint = env.STORAGE_ENDPOINT;

  if (endpoint) {
    return `${endpoint}/${env.STORAGE_BUCKET}/${key}`;
  }

  return `https://${env.STORAGE_BUCKET}.s3.${env.STORAGE_REGION}.amazonaws.com/${key}`;
}
