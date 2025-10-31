import {Router} from 'express';
import {
	userAuthSchema,
	userCreateSchema,
	userEmailSchema,
	userEmailVerificationSchema,
	userUpdatePasswordFromResetLinkSchema,
} from '../../types/auth.ts';
import {validateBody} from '../../middlewares/validationMiddleware.ts';
import * as authMiddleware from '../../middlewares/authMiddleware.ts';
import * as fingerprintMiddleware from '../../middlewares/fingerprintMiddleware.ts';
import * as authController from '../../controllers/authController.ts';
import * as rateLimitMiddleware from '../../middlewares/rateLimitMiddleware.ts';
const router = Router();

router.get('/auth/users/session', authController.getSession);

router.post(
	'/auth/users',
	rateLimitMiddleware.createAccountLimiter,
	authMiddleware.isNotLogged,
	validateBody(userCreateSchema),
	authController.createUser
);

router.put(
	'/auth/users/email/verification',
	authMiddleware.isNotLogged,
	validateBody(userEmailVerificationSchema),
	authController.verifyUserEmail
);

router.put(
	'/auth/users/email/verification/token',
	rateLimitMiddleware.emailTokenLimiter,
	authMiddleware.isNotLogged,
	validateBody(userEmailSchema),
	authController.sendEmailVerificationToken
);

router.put(
	'/auth/users/password/recover/link-token',
	rateLimitMiddleware.passwordTokenLimiter,
	authMiddleware.isNotLogged,
	validateBody(userEmailSchema),
	authController.sendRecoverPasswordLinkToken
);

router.put(
	'/auth/users/password/from-link',
	authMiddleware.isNotLogged,
	validateBody(userUpdatePasswordFromResetLinkSchema),
	authController.updatePasswordFromResetLink
);

router.post(
	'/auth/admins/login',
	rateLimitMiddleware.adminLoginLimiter,
	authMiddleware.isNotLogged,
	validateBody(userAuthSchema),
	authController.adminLogin
);

router.post(
	'/auth/users/login',
	rateLimitMiddleware.loginLimiter,
	authMiddleware.isNotLogged,
	validateBody(userAuthSchema),
	authController.login
);

router.get(
	'/auth/users/logout',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authController.logout
);

export default router;
