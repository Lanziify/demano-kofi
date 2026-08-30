import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@/env';
import { s3Client } from '@/lib/storage/s3';
import { bucket } from '@/lib/storage/storage';
import type { UploadBucketValues } from '@/schema/media.schema';

export class StorageService {
  async uploadObject({ key, body, contentType }: UploadBucketValues) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  }

  async downloadObject(key: string) {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      throw new Error(`Storage object "${key}" has no body`);
    }

    const bytes = await response.Body.transformToByteArray();

    return Buffer.from(bytes);
  }

  async deleteObject(key: string) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }

  getPublicUrl(key: string) {
    const endpoint = env.STORAGE_ENDPOINT;

    if (endpoint) {
      return `${endpoint}/${env.STORAGE_BUCKET}/${key}`;
    }

    return `https://${env.STORAGE_BUCKET}.s3.${env.STORAGE_REGION}.amazonaws.com/${key}`;
  }
}
