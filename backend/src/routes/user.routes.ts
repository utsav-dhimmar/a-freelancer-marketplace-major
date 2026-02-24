import { Router } from 'express';
import {
  login,
  logout,
  me,
  refreshTokenHandler,
  register,
  updateProfilePicture,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadProfilePicture } from '../utils/multer.config.js';

const router = Router();

router.post(
  '/register',
  uploadProfilePicture.single('profilePicture'),
  register,
);

router.post('/login', login);

router.get('/me', authMiddleware, me);

router.post('/logout', authMiddleware, logout);

router.post('/refresh-token', refreshTokenHandler);

/**
 * @route   POST /api/users/profile-picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post(
  '/profile-picture',
  authMiddleware,
  uploadProfilePicture.single('profilePicture'),
  updateProfilePicture,
);

export default router;
