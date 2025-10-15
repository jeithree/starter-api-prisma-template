import authRouter from './auth/authRoute.ts';
import oAuthRoter from './oauth/oAuthRoute.ts';

import userRouter from './user/userRoute.ts';
import adminRouter from './admin/adminRoute.ts';

export const v1routeDefinitions = [
	{prefix: '/api/v1', router: authRouter},
	{prefix: '/api/v1', router: oAuthRoter},
	{prefix: '/api/v1', router: userRouter},
	{prefix: '/api/v1', router: adminRouter},
];
