import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadToR2 = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const key = `orders/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return public URL
  const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
  return publicUrl;
};

export default r2Client;