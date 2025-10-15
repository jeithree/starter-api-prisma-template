import cors from 'cors';
import {CORS_ORIGIN_WHITELIST} from '../configs/basic.ts';

export const startCors = () => {
	return cors({
		origin: CORS_ORIGIN_WHITELIST,
		credentials: true,
	});
};
