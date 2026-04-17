import { Router } from 'express';
import {
  login,
  logout,
  me,
  refreshTokenHandler,
  register,
  updateProfilePicture,
  getUserPublicProfile,
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../schemas/user.schema.js';
import { uploadProfilePicture } from '../utils/multer.config.js';

const router = Router();

router.post(
  '/register',
  uploadProfilePicture.single('profilePicture'),
  validate(registerSchema),
  register,
);

router.post('/login', validate(loginSchema), login);

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

/**
 * @route   GET /api/users/profile/:id
 * @desc    Get public profile info
 * @access  Public
 */
router.get('/profile/:id', getUserPublicProfile);

export default router;
