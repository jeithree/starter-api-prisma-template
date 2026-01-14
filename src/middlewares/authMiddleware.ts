import type {Request, Response, NextFunction} from 'express';
// import {z} from 'zod';
import {SITE_URL} from '../configs/basic.ts';
import {ForbiddenError} from '../lib/domainError.ts';
import * as Logger from '../helpers/logger.ts';
import {translate} from '../helpers/helper.ts';

export const isSocialNotLogged = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (req.session?.isLogged) {
		return res.redirect(`${SITE_URL}${req.query.onSuccess}`);
	}
	next();
};

export const isNotLogged = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	if (req.session?.isLogged) {
		Logger.log(
			`Forbidden attempt to access ${req.path} for already logged-in user`,
			'info'
		);

		return next(
			new ForbiddenError({
				errorCode: 'ALREADY_LOGGED_IN',
				message: translate('auth.errors.ALREADY_LOGGED_IN'),
				data: {authErrors: {isAuthenticated: true}},
			})
		);
	}
	next();
};

export const isLogged = (req: Request, _res: Response, next: NextFunction) => {
	if (!req.session?.isLogged) {
		Logger.log(
			`Forbidden attempt to access ${req.path} by non-logged-in user`,
			'info'
		);
		return next(
			new ForbiddenError({
				errorCode: 'NOT_LOGGED_IN',
				message: translate('auth.errors.NOT_LOGGED_IN'),
				data: {authErrors: {isAuthenticated: false}},
			})
		);
	}
	next();
};

export const requireRole = (role: ('ADMIN' | 'MANAGER')[]) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!role.includes(req.session?.role as 'ADMIN' | 'MANAGER')) {
			Logger.log(
				`Forbidden attempt to access route ${req.path} by user with role ${
					req.session?.role || 'USER'
				}`,
				'info'
			);
			return next(
				new ForbiddenError({
					errorCode: 'INSUFFICIENT_PERMISSIONS',
					message: translate('auth.errors.INSUFFICIENT_PERMISSIONS'),
					data: {authErrors: {isAuthorized: false}},
				})
			);
		}
		next();
	};
};
