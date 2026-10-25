import { Router } from 'express';
import {
  getMyDocuments,
  getDriverDocuments,
  updateDocuments,
  updateSpecificDocument,
  verifyDocuments,
  getAllDriverDocuments
} from '../controllers/document.controller.js';
import { authenticate, requireDriver, requireAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  updateDocumentsSchema,
  updateSpecificDocumentSchema,
  verifyDocumentSchema
} from '../validators/document.validator.js';

const router = Router();

router.use(authenticate);

// Driver personal document endpoints
router.get('/me', requireDriver, getMyDocuments);

router.post('/upload', requireDriver, upload.any(), validate(updateDocumentsSchema), updateDocuments);
router.post('/:docType', requireDriver, upload.any(), validate(updateSpecificDocumentSchema), updateSpecificDocument);
router.patch('/:docType', requireDriver, upload.any(), validate(updateSpecificDocumentSchema), updateSpecificDocument);
router.patch('/upload', requireDriver, upload.any(), validate(updateDocumentsSchema), updateDocuments);

// Admin endpoints
router.get('/all', requireAdmin, getAllDriverDocuments);
router.get('/', requireAdmin, getAllDriverDocuments);

// Specific driver documents
router.get('/driver/:driverId', getDriverDocuments);

// Admin verification
router.patch('/driver/:driverId/verify', requireAdmin, validate(verifyDocumentSchema), verifyDocuments);

export default router;
