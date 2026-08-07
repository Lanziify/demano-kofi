import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/storage/s3';
import { bucket } from '@/lib/storage/storage';

export class StorageService {
  async uploadObject({
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

  async deleteObject(key: string) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }
}
