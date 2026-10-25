import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getUserPromotion,
  getDriverPromotion,
  removePromotionImage
} from '../controllers/setting.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

const promotionUpload = upload.fields([
  { name: 'userPromotionImage', maxCount: 1 },
  { name: 'driverPromotionImage', maxCount: 1 }
]);

// ─── Client Endpoints (Get Settings & Promotion Banners) ──────────────────────
router.get('/', getSettings);
router.get('/promotions/user', getUserPromotion);
router.get('/promotions/driver', getDriverPromotion);

// ─── Admin Endpoints (Upload & Update Promotion Images) ────────────────────────
router.patch('/', authenticate, requireAdmin, promotionUpload, updateSettings);
router.put('/', authenticate, requireAdmin, promotionUpload, updateSettings);
router.post('/upload', authenticate, requireAdmin, promotionUpload, updateSettings);
router.delete('/promotions/:target', authenticate, requireAdmin, removePromotionImage);

export default router;
