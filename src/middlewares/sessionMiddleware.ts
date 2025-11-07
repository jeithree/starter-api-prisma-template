import type {NextFunction, Request, Response} from 'express';
import session from 'express-session';
import {RedisStore} from 'connect-redis';
import redisClient from '../redisClient.ts';
import {SESSION_COOKIE} from '../configs/cookies.ts';
import {SESSION_SECRET, SESSION_PREFIX} from '../configs/basic.ts';

let redisStore = new RedisStore({
	client: redisClient,
	prefix: SESSION_PREFIX,
});

export const createSession = () => {
	return session({
		secret: [SESSION_SECRET], // first element has to be the new secret, read Docs
		name: SESSION_COOKIE.name,
		resave: false,
		saveUninitialized: false,
		cookie: {...SESSION_COOKIE.options, maxAge: SESSION_COOKIE.maxAge},
		store: redisStore,
	});
};

/**
 * Creates a middleware to renew session TTL periodically.
 * @param intervalMs - How often to renew (default: 30 minutes)
 */
export const createSessionTouchMiddleware = (intervalMs = 30 * 60 * 1000) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (req.session.isLogged) {
			const now = Date.now();
			if (
				!req.session.lastTouched ||
				now - req.session.lastTouched > intervalMs
			) {
				req.session.touch();
				req.session.lastTouched = now;
			}
		}
		next();
	};
};
