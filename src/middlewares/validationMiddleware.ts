import type {NextFunction, Request, Response} from 'express';
import {z, ZodError} from 'zod';
import {ValidationError} from '../lib/domainError.ts';
import {translate} from '../helpers/helper.ts';
import * as Logger from '../helpers/logger.ts';

export const validateBody = (schema: z.ZodSchema<any>) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const body = schema.parse(req.body);
			Object.assign(req.body, body);
			return next();
		} catch (error) {
			Logger.logToFile(
				`Body validation error: ${JSON.stringify(
					{
						method: req.method,
						path: req.path,
						bodyKeys: Object.keys(req.body),
					},
					null,
					2
				)}`,
				'info'
			);

			if (error instanceof ZodError) {
				const validationErrors = error.issues.map((err) => ({
					field: err.path.join('.'),
					message: translate(
						err.message || 'validation.UNKNOWN_VALIDATION_ERROR'
					),
				}));

				return next(
					new ValidationError({
						messageKey: 'validation.INVALID_REQUEST',
						data: validationErrors,
					})
				);
			}

			return next(
				new ValidationError({messageKey: 'validation.INVALID_REQUEST'})
			);
		}
	};
};

// this one sometimes shouldnt expose some details so test the error
export const validateQuery = (schema: z.ZodSchema<any>) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			const query = schema.parse(req.query);
			Object.assign(req.query, query);
			return next();
		} catch (error) {
			Logger.logToFile(
				`Query validation error: ${JSON.stringify(
					{
						method: req.method,
						path: req.path,
						queryKeys: Object.keys(req.query),
					},
					null,
					2
				)}`,
				'info'
			);

			if (error instanceof ZodError) {
				const validationErrors = error.issues.map((err) => ({
					field: err.path.join('.'),
					message: translate(
						err.message || 'validation.UNKNOWN_VALIDATION_ERROR'
					),
				}));

				return next(
					new ValidationError({
						messageKey: 'validation.INVALID_REQUEST',
						data: validationErrors,
					})
				);
			}

			return next(
				new ValidationError({messageKey: 'validation.INVALID_REQUEST'})
			);
		}
	};
};
