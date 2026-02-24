import multer from 'multer';
import path from 'path';
import { ApiError } from './ApiHelper.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Multer storage configuration for profile pictures
 */
const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'public/profiles');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter for images only
 */
const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Only image files are allowed (jpeg, png, gif, webp)',
      ),
    );
  }
};

/**
 * Multer upload instance for profile pictures
 * Max file size: 5MB
 */
export const uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
