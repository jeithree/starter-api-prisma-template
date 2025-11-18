import type {Request, Response, NextFunction} from 'express';
import {ZodError} from 'zod';
import * as Logger from '../helpers/logger.ts';
import {MAX_IMAGE_UPLOAD_SIZE, MAX_PAYLOAD_SIZE} from '../configs/basic.ts';
import DomainError, {ServerError} from '../lib/domainError.ts';
import ApiResponse from '../lib/apiResponse.ts';
import {REDIRECT_ERROR_COOKIE} from '../configs/cookies.ts';
import {translate} from '../helpers/helper.ts';

export const errorHandler = async (
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	Logger.logToFile(error, 'error');

	if ((error as any)?.type === 'entity.too.large') {
		return res.status(413).json(
			ApiResponse.error({
				errorCode: 'PAYLOAD_TOO_LARGE',
				message: translate('server.errors.PAYLOAD_TOO_LARGE', {
					maxAllowedSize: MAX_PAYLOAD_SIZE,
				}),
			})
		);
	}

	if ((error as any)?.code === 'FILE_IMAGE_TOO_LARGE') {
		return res.status(413).json(
			ApiResponse.error({
				errorCode: 'FILE_IMAGE_TOO_LARGE',
				message: translate('validation.FILE_IMAGE_TOO_LARGE', {
					maxFileSize: MAX_IMAGE_UPLOAD_SIZE,
				}),
			})
		);
	}

	// Keep this just I forget to catch some ZodError previously
	// This should never happen if all routes are properly validated
	// But just in case, we handle it gracefully
	if (error instanceof ZodError) {
		await Logger.logToFile(`Unhandled ZodError: ${error.issues}`, 'warn');

		return res.status(400).json(
			ApiResponse.error({
				errorCode: 'INVALID_REQUEST',
				message: translate('validation.INVALID_REQUEST'),
			})
		);
	}

	if (error instanceof DomainError) {
		const errorRespondObject = ApiResponse.error(error);

		if (error.shouldRedirect) {
			res.cookie(REDIRECT_ERROR_COOKIE.name, errorRespondObject.error?.message, {
				...REDIRECT_ERROR_COOKIE.options,
				maxAge: REDIRECT_ERROR_COOKIE.maxAge,
			});

			return res.redirect(error.redirectUrl);
		}

		return res.status(error.statusCode).json(errorRespondObject);
	}

	const serverError = new ServerError({
		errorCode: 'INTERNAL_SERVER_ERROR',
		message: translate('server.errors.INTERNAL_SERVER_ERROR'),
	});

	return res.status(serverError.statusCode).json(ApiResponse.error(serverError));
};
