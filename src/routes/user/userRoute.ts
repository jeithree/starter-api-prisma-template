import {Router} from 'express';
import {paginationQuerySchema} from '../../types/pagination.ts';
import {userUpdatePasswordSchema} from '../../types/user.ts';
import {
	validateBody,
	validateQuery,
} from '../../middlewares/validationMiddleware.ts';
import * as authMiddleware from '../../middlewares/authMiddleware.ts';
import * as fingerprintMiddleware from '../../middlewares/fingerprintMiddleware.ts';
import * as userController from '../../controllers/userController.ts';
// import * as rateLimitMiddleware from '../../middlewares/rateLimitMiddleware.ts';
const router = Router();

router.get(
	'/users',
    authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	validateQuery(paginationQuerySchema),
	userController.getUser
);

router.put(
	'/users/password',
    authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	validateBody(userUpdatePasswordSchema),
	userController.updatePasswordAfterValidatingOldOne
);

export default router;
