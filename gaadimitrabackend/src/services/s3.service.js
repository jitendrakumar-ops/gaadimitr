import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as generateAwsSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import { getS3Client, S3_BUCKET_NAME } from '../config/s3.js';
import { AppError } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class S3Service {
  /**
   * Validate file buffer, mime type, and extension
   */
  static validateFile(file) {
    if (!file) {
      throw new AppError('No file provided for upload', 400, 'FILE_MISSING');
    }

    if (file.mimetype === 'application/octet-stream' && file.originalname) {
      const ext = path.extname(file.originalname).toLowerCase();
      const extMap = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf'
      };
      if (extMap[ext]) {
        file.mimetype = extMap[ext];
      }
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, PDF`,
        400,
        'INVALID_FILE_TYPE'
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError('File size exceeds the 10MB limit', 400, 'FILE_TOO_LARGE');
    }
  }

  /**
   * Upload buffer directly to AWS S3
   */
  static async uploadFile(file, folder = 'general') {
    this.validateFile(file);

    const s3 = getS3Client();
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueKey = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

    // Development/Test mock fallback
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'test-key-id') {
      const mockUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueKey}`;
      logger.info({ uniqueKey, mockUrl }, 'File uploaded in mock S3 mode');
      return {
        key: uniqueKey,
        url: mockUrl,
        bucket: S3_BUCKET_NAME,
        mimetype: file.mimetype,
        size: file.size
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname
        }
      });

      await s3.send(command);

      const publicUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueKey}`;

      return {
        key: uniqueKey,
        url: publicUrl,
        bucket: S3_BUCKET_NAME,
        mimetype: file.mimetype,
        size: file.size
      };
    } catch (error) {
      logger.error({ error: error.message, key: uniqueKey }, 'S3 upload failed');
      throw new AppError('Failed to upload file to storage', 500, 'S3_UPLOAD_ERROR');
    }
  }

  /**
   * Delete object from S3
   */
  static async deleteFile(key) {
    if (!key) return;

    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'test-key-id') {
      logger.info({ key }, 'File deleted in mock S3 mode');
      return true;
    }

    try {
      const s3 = getS3Client();
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key
      });
      await s3.send(command);
      return true;
    } catch (error) {
      logger.error({ error: error.message, key }, 'S3 deletion failed');
      return false;
    }
  }

  /**
   * Generate pre-signed GET URL for secure temporary file access
   */
  static async getSignedUrl(key, expiresInSeconds = 3600) {
    if (!key) return null;

    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === 'test-key-id') {
      return `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}?signed=true`;
    }

    try {
      const s3 = getS3Client();
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key
      });
      return await generateAwsSignedUrl(s3, command, { expiresIn: expiresInSeconds });
    } catch (error) {
      logger.error({ error: error.message, key }, 'Failed to generate signed S3 URL');
      return null;
    }
  }
}

export default S3Service;
