import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

function getEnv(name: string, required = true): string {
  const v = process.env[name] || '';
  if (required && !v) throw new Error(`Missing env ${name}`);
  return v;
}

let client: S3Client | null = null;
export function getR2Client(): S3Client {
  if (client) return client;
  const endpoint = getEnv('R2_ENDPOINT');
  const accessKeyId = getEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = getEnv('R2_SECRET_ACCESS_KEY');
  client = new S3Client({
    region: 'auto',
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

export async function r2PutPdf(bucket: string, key: string, body: Uint8Array) {
  const c = getR2Client();
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'application/pdf' });
  await c.send(cmd);
}

export async function r2GetPdf(bucket: string, key: string) {
  const c = getR2Client();
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return c.send(cmd);
}

export function makeArticleKey(title: string, uuid: string): string {
  const year = new Date().getFullYear();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `articles/${year}/${slug}-${uuid}.pdf`;
}

export function makeBookKey(title: string, uuid: string): string {
  const year = new Date().getFullYear();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `books/${year}/${slug}-${uuid}.pdf`;
}

export function makeSubmissionKey(title: string, userId: number, uuid: string): string {
  const year = new Date().getFullYear();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `submissions/${year}/${userId}/${slug}-${uuid}.pdf`;
}
