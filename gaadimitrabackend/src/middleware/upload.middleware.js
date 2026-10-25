import path from 'path';
import multer from 'multer';
import { AppError } from '../utils/helpers.js';

const storage = multer.memoryStorage();

const EXT_MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf'
};

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  // If client/Postman sends application/octet-stream, infer from file extension
  if (file.mimetype === 'application/octet-stream' && file.originalname) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (EXT_MIME_MAP[ext]) {
      file.mimetype = EXT_MIME_MAP[ext];
    }
  }

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, PDF`,
        400,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

export default upload;
