import { Router } from 'express';
import { getMessages, sendMessage, markAsRead } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/:bookingId/messages', getMessages);
router.post('/:bookingId/messages', upload.single('attachment'), sendMessage);
router.patch('/:bookingId/read', markAsRead);

export default router;
