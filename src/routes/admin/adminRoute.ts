import {Router} from 'express';
import {paginationQuerySchema} from '../../types/pagination.ts';
import {validateQuery} from '../../middlewares/validationMiddleware.ts';
import * as authMiddleware from '../../middlewares/authMiddleware.ts';
import * as fingerprintMiddleware from '../../middlewares/fingerprintMiddleware.ts';
import * as adminController from '../../controllers/adminController.ts';
const router = Router();

router.get(
	'/admins/users',
    authMiddleware.isLogged,
    authMiddleware.isAdmin,
	fingerprintMiddleware.validateFingerprint,
	validateQuery(paginationQuerySchema),
	adminController.getUsers
);

export default router;
