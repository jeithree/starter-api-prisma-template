import type {Request, Response, NextFunction} from 'express';
import {deviceIdSchema} from '../types/session.ts';
import {AuthenticationError} from '../lib/domainError.ts';
import * as Logger from '../helpers/logger.ts';
import {DEVICE_ID_COOKIE} from '../configs/cookies.ts';

export const validateFingerprint = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const fingerprint = req.session.fingerprint;

	const cookieDeviceId = req.cookies[DEVICE_ID_COOKIE.name];
	const sessionDeviceId = fingerprint?.deviceId;

	Logger.logToConsoleIfDevMode('cookieDeviceId', cookieDeviceId);
	Logger.logToConsoleIfDevMode('sessionDeviceId', sessionDeviceId);

	const cookieCheck = deviceIdSchema.safeParse(cookieDeviceId);
	const sessionCheck = deviceIdSchema.safeParse(sessionDeviceId);

	if (!cookieCheck.success || !sessionCheck.success) {
		Logger.logToFile(
			`Fingerprint validation failed: ${JSON.stringify(
				{
					ip: fingerprint?.ip,
					sessionDeviceId,
					cookieDeviceId,
				},
				null,
				2
			)}`,
			'info'
		);
		return next(
			new AuthenticationError({
				messageKey: 'auth.errors.NOT_AUTHENTICATED',
				data: {
					notAuthorized: true,
					sessionInvalid: true,
				},
			})
		);
	}

	if (cookieCheck.data !== sessionCheck.data) {
		Logger.logToFile(
			`Fingerprint mismatch: ${JSON.stringify(
				{
					ip: fingerprint?.ip,
					sessionDeviceId,
					cookieDeviceId,
				},
				null,
				2
			)}`,
			'info'
		);
		return next(
			new AuthenticationError({
				messageKey: 'auth.errors.NOT_AUTHENTICATED',
				data: {
					notAuthorized: true,
					sessionInvalid: true,
				},
			})
		);
	}

	return next();
};

// I need to add some support for the IP checking later
