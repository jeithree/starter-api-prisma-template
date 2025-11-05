import {Router} from 'express';
import {
	userUpdatePasswordSchema,
	userUpdateProfileSchema,
} from '../../types/user.ts';
import {validateBody} from '../../middlewares/validationMiddleware.ts';
import * as authMiddleware from '../../middlewares/authMiddleware.ts';
import * as fingerprintMiddleware from '../../middlewares/fingerprintMiddleware.ts';
import * as userController from '../../controllers/userController.ts';
// import * as rateLimitMiddleware from '../../middlewares/rateLimitMiddleware.ts';
import imageUploadMiddleware from '../../middlewares/imageUploadMiddleware.ts';
const router = Router();

// TODO: Add rate limiting middleware where appropriate
router.get(
	'/users/me',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	userController.getUserProfile
);

router.put(
	'/users/profile',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	imageUploadMiddleware.single('avatar'),
	validateBody(userUpdateProfileSchema),
	userController.updateUserProfile
);

router.put(
	'/users/password',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	validateBody(userUpdatePasswordSchema),
	userController.updatePasswordAfterValidatingOldOne
);

export default router;
