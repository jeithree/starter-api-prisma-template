import type {Request, Response, NextFunction} from 'express';
import rateLimit from 'express-rate-limit';
import * as Logger from '../helpers/logger.ts';
import {translate} from '../helpers/helper.ts';
import {RateLimitError} from '../lib/domainError.ts';

export const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.log(`Rate limit exceeded for create account: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				errorCode: 'CREATE_ACCOUNT_RATE_LIMIT_EXCEEDED',
				message: translate('rateLimit.CREATE_ACCOUNT_RATE_LIMIT_EXCEEDED'),
			})
		);
	},
});

export const adminLoginLimiter = rateLimit({
	windowMs: 30 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.log(`Rate limit exceeded for login: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				errorCode: 'ADMIN_LOGIN_RATE_LIMIT_EXCEEDED',
				message: translate('rateLimit.ADMIN_LOGIN_RATE_LIMIT_EXCEEDED'),
			})
		);
	},
});

export const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.log(`Rate limit exceeded for login: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				errorCode: 'LOGIN_RATE_LIMIT_EXCEEDED',
				message: translate('rateLimit.LOGIN_RATE_LIMIT_EXCEEDED'),
			})
		);
	},
});

export const emailTokenLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.log(`Rate limit exceeded for email token: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				errorCode: 'EMAIL_VERIFICATION_TOKEN_RATE_LIMIT_EXCEEDED',
				message: translate(
					'rateLimit.EMAIL_VERIFICATION_TOKEN_RATE_LIMIT_EXCEEDED',
					{
						maxAllowedAttempts: '5',
						timeWindowNumber: '1',
						timeWindowUnit: translate('units.hour'),
					}
				),
			})
		);
	},
});

export const passwordTokenLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.log(`Rate limit exceeded for password token: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				errorCode: 'PASSWORD_RESET_REQUEST_RATE_LIMIT_EXCEEDED',
				message: translate(
					'rateLimit.PASSWORD_RESET_REQUEST_RATE_LIMIT_EXCEEDED'
				),
			})
		);
	},
});

export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.log(`Rate limit exceeded for general requests: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				errorCode: 'GENERAL_RATE_LIMIT_EXCEEDED',
				message: translate('rateLimit.GENERAL_RATE_LIMIT_EXCEEDED'),
			})
		);
	},
});
