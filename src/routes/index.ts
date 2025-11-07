import authRouter from './authRoute.ts';
import oAuthRoter from './oAuthRoute.ts';

import userRouter from './userRoute.ts';
import adminRouter from './adminRoute.ts';

export const v1routeDefinitions = [
	{prefix: '/api/v1', router: authRouter},
	{prefix: '/api/v1', router: oAuthRoter},
	{prefix: '/api/v1', router: userRouter},
	{prefix: '/api/v1', router: adminRouter},
];
