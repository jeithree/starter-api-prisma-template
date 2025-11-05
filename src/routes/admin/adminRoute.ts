import {Router} from 'express';
import {adminGetUsersSchema} from '../../types/admin.ts';
import {
	adminCreateUserSchema,
	adminUpdateUserSchema,
	adminDeleteUserSchema,
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
	'admins/users/',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	validateBody(adminUpdateUserSchema),
	adminController.updateUser
);

router.delete(
	'/admins/users/',
	authMiddleware.isLogged,
	authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	validateBody(adminDeleteUserSchema),
	adminController.deleteUser
);

export default router;
