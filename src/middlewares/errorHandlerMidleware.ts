import type {Request, Response, NextFunction} from 'express';
import {ZodError} from 'zod';
import * as Logger from '../helpers/logger.ts';
import {DEV_MODE, MAX_PAYLOAD_SIZE} from '../configs/basic.ts';
import DomainError, {ServerError} from '../lib/domainError.ts';
import ApiResponse from '../lib/apiResponse.ts';

export const errorHandler = (
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	Logger.logToFile(error, 'error');

	if ((error as any)?.type === 'entity.too.large') {
		return res.status(413).json(
			ApiResponse.error({
				messageKey: 'server.errors.PAYLOAD_TOO_LARGE',
				data: {maxAllowedSize: MAX_PAYLOAD_SIZE},
			})
		);
	}

	// Keep this just I forget to catch some ZodError previously
	// This should never happen if all routes are properly validated
	// But just in case, we handle it gracefully
	if (error instanceof ZodError) {
		return res.status(400).json(
			ApiResponse.error({
				messageKey: 'validation.INVALID_REQUEST',
				data: DEV_MODE ? error.issues : null,
			})
		);
	}

	if (error instanceof DomainError) {
		const errorRespondObject = ApiResponse.error(error);

		if (error.shouldRedirect) {
			return res.redirect(
				`${error.redirectUrl}?error_message=${errorRespondObject.error?.message}`
			);
		}

		return res.status(error.statusCode).json(errorRespondObject);
	}

	const serverError = new ServerError({
		messageKey: 'server.errors.INTERNAL_SERVER_ERROR',
		data: DEV_MODE ? error : null,
	});

	return res
		.status(serverError.statusCode)
		.json(ApiResponse.error(serverError));
};
