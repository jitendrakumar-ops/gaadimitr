import { S3Client } from '@aws-sdk/client-s3';
import logger from '../utils/logger.js';

let s3ClientInstance = null;

export const initS3Client = () => {
  if (s3ClientInstance) return s3ClientInstance;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey || accessKeyId === 'test-key-id') {
    logger.warn('AWS S3 credentials are test or missing. S3 operations will run with mock/test handlers.');
  }

  s3ClientInstance = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKeyId || 'mock-key',
      secretAccessKey: secretAccessKey || 'mock-secret'
    }
  });

  return s3ClientInstance;
};

export const getS3Client = () => {
  if (!s3ClientInstance) {
    return initS3Client();
  }
  return s3ClientInstance;
};

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET || 'vehicle-booking-uploads';

export default { initS3Client, getS3Client, S3_BUCKET_NAME };
