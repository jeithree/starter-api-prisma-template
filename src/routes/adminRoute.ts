import {Router} from 'express';
import {
	adminGetUsersSchema,
	adminCreateUserSchema,
	adminUpdateUserSchema,
	adminGetSessionsSchema,
} from '../../types/admin.ts';
import {
	validateQuery,
	validateBody,
} from '../../middlewares/validationMiddleware.ts';
import * as authMiddleware from '../../middlewares/authMiddleware.ts';
import * as fingerprintMiddleware from '../../middlewares/fingerprintMiddleware.ts';
import * as adminController from '../../controllers/adminController.ts';
const router = Router();

router.get(
	'/admins/users/:userId',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	adminController.getUserById
);

router.get(
	'/admins/users',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	validateQuery(adminGetUsersSchema),
	adminController.getUsers
);

router.post(
	'/admins/users',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	validateBody(adminCreateUserSchema),
	adminController.createUser
);

router.put(
	'/admins/users/:userId',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	validateBody(adminUpdateUserSchema),
	adminController.updateUser
);

router.delete(
	'/admins/users/:userId',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	adminController.deleteUser
);

router.get(
	'/admins/sessions',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	validateQuery(adminGetSessionsSchema),
	adminController.getActiveSessions
);

router.delete(
	'/admins/sessions/:sessionId',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	adminController.deleteSession
);

export default router;
