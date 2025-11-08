import type {Request, Response, NextFunction} from 'express';
import rateLimit from 'express-rate-limit';
import * as Logger from '../helpers/logger.ts';
import {translate} from '../helpers/helper.ts';
import {RateLimitError} from '../lib/domainError.ts';

//TODO: Decide if the data will be replacements or data object in the RateLimitError

export const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.logToFile(
			`Rate limit exceeded for create account: ${req.ip}`,
			'info'
		);
		next(
			new RateLimitError({
				messageKey: 'rateLimit.CREATE_ACCOUNT_RATE_LIMIT_EXCEEDED',
				replacements: {
					maxAllowedAttempts: '5',
					timeWindowNumber: '1',
					timeWindowUnit: translate('units.hour'),
				},
			})
		);
	},
});

export const adminLoginLimiter = rateLimit({
	windowMs: 30 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.logToFile(`Rate limit exceeded for login: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				messageKey: 'rateLimit.ADMIN_LOGIN_RATE_LIMIT_EXCEEDED',
			})
		);
	},
});

export const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.logToFile(`Rate limit exceeded for login: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				messageKey: 'rateLimit.LOGIN_RATE_LIMIT_EXCEEDED',
				// data: {
				// 	maxAllowedAttempts: 10,
				// 	timeWindowNumber: 15,
				// 	timeWindowUnit: 'minutes',
				// },
			})
		);
	},
});

export const emailTokenLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.logToFile(`Rate limit exceeded for email token: ${req.ip}`, 'info');
		next(
			new RateLimitError({
				messageKey: 'rateLimit.EMAIL_VERIFICATION_TOKEN_RATE_LIMIT_EXCEEDED',
                replacements: {
					maxAllowedAttempts: '5',
					timeWindowNumber: '10',
					timeWindowUnit: translate('units.minutes'),
				},
			})
		);
	},
});

export const passwordTokenLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 5,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.logToFile(
			`Rate limit exceeded for password token: ${req.ip}`,
			'info'
		);
		next(
			new RateLimitError({
				messageKey: 'rateLimit.PASSWORD_RESET_REQUEST_RATE_LIMIT_EXCEEDED',
				// data: {
				// 	maxAllowedAttempts: 5,
				// 	timeWindowNumber: 10,
				// 	timeWindowUnit: 'minutes',
				// },
			})
		);
	},
});

export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 200,
	handler: (req: Request, _res: Response, next: NextFunction) => {
		Logger.logToFile(
			`Rate limit exceeded for general requests: ${req.ip}`,
			'info'
		);
		next(
			new RateLimitError({
				messageKey: 'rateLimit.GENERAL_RATE_LIMIT_EXCEEDED',
				// data: {
				// 	maxAllowedAttempts: 100,
				// 	timeWindowNumber: 15,
				// 	timeWindowUnit: 'minutes',
				// },
			})
		);
	},
});
