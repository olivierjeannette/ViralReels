// ViralReels - Cloudflare R2 Storage Client
// Last updated: 2026-01-19

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration du client S3 pour Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer | ReadableStream,
  contentType: string,
  metadata?: Record<string, string>
): Promise<string> {
  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    },
  });

  await upload.done();

  return `${PUBLIC_URL}/${key}`;
}

/**
 * Get a signed URL for temporary access (download)
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Get a signed URL for upload
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Get file key from full URL
 */
export function getKeyFromUrl(url: string): string {
  return url.replace(`${PUBLIC_URL}/`, '');
}

/**
 * Generate a storage path for a video
 */
export function generateVideoPath(userId: string, filename: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `videos/${userId}/${year}/${month}/${filename}`;
}

/**
 * Generate a storage path for a clip
 */
export function generateClipPath(userId: string, videoId: string, filename: string): string {
  return `clips/${userId}/${videoId}/${filename}`;
}

/**
 * Generate a storage path for a thumbnail
 */
export function generateThumbnailPath(userId: string, videoId: string, filename: string): string {
  return `thumbnails/${userId}/${videoId}/${filename}`;
}
