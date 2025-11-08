import {Router} from 'express';
import {
	adminGetUsersSchema,
	adminCreateUserSchema,
	adminUpdateUserSchema,
	adminGetSessionsSchema,
} from '../types/admin.ts';
import {
	validateQuery,
	validateBody,
} from '../middlewares/validationMiddleware.ts';
import * as authMiddleware from '../middlewares/authMiddleware.ts';
import * as fingerprintMiddleware from '../middlewares/fingerprintMiddleware.ts';
import * as adminController from '../controllers/adminController.ts';
const router = Router();

router.get(
	'/admins/users/:userId',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authMiddleware.requireRole(['ADMIN', 'MANAGER']),
	adminController.getUserById
);

router.get(
	'/admins/users',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authMiddleware.requireRole(['ADMIN', 'MANAGER']),
	validateQuery(adminGetUsersSchema),
	adminController.getUsers
);

router.post(
	'/admins/users',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authMiddleware.requireRole(['ADMIN', 'MANAGER']),
	validateBody(adminCreateUserSchema),
	adminController.createUser
);

router.put(
	'/admins/users/:userId',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authMiddleware.requireRole(['ADMIN']),
	validateBody(adminUpdateUserSchema),
	adminController.updateUser
);

router.delete(
	'/admins/users/:userId',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authMiddleware.requireRole(['ADMIN']),
	adminController.deleteUser
);

router.get(
	'/admins/sessions',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authMiddleware.requireRole(['ADMIN', 'MANAGER']),
	validateQuery(adminGetSessionsSchema),
	adminController.getActiveSessions
);

router.delete(
	'/admins/sessions/:sessionId',
	authMiddleware.isLogged,
	fingerprintMiddleware.validateFingerprint,
	authMiddleware.requireRole(['ADMIN']),
	adminController.deleteSession
);

export default router;
