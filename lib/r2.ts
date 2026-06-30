import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getR2Client(): S3Client | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) return null;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// 15 dakikalık indirme URL'i
export async function signedDownloadUrl(key: string): Promise<string | null> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!client || !bucket) return null;
  try {
    return await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 900 }
    );
  } catch {
    return null;
  }
}

// 10 dakikalık upload URL'i (admin medya yüklemesi için)
export async function signedUploadUrl(key: string, contentType: string): Promise<string | null> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!client || !bucket) return null;
  try {
    return await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
      { expiresIn: 600 }
    );
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<boolean> {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!client || !bucket) return false;
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// students/<studentId>/<uuid>.<ext>
export function buildMediaKey(studentId: string, filename: string): string {
  const ext = filename.includes('.') ? filename.split('.').pop()!.toLowerCase() : 'bin';
  const uuid = crypto.randomUUID();
  return `students/${studentId}/${uuid}.${ext}`;
}

export function r2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
}
