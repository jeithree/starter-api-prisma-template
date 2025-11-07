import {Router} from 'express';
import * as authMiddleware from '../middlewares/authMiddleware.ts';
import * as oAuthController from '../controllers/oAuthController.ts';
// import * as rateLimitMiddleware from '../middlewares/rateLimitMiddleware.ts'; add later if needed
const router = Router();

router.get(
	'/oauth/users/:provider/url',
	authMiddleware.isSocialNotLogged,
	oAuthController.getOAuthProviderUrl
);

router.get(
	'/oauth/users/:provider/login',
	authMiddleware.isSocialNotLogged,
	oAuthController.loginWithOAuthProvider
);

export default router;
