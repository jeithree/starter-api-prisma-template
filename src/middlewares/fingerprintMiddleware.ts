import type {Request, Response, NextFunction} from 'express';
import {deviceIdSchema} from '../types/session.ts';
import {AuthenticationError} from '../lib/domainError.ts';
import * as Logger from '../helpers/logger.ts';
import {DEVICE_ID_COOKIE} from '../configs/cookies.ts';
import {translate} from '../helpers/helper.ts';

export const validateFingerprint = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const fingerprint = req.session.fingerprint;

	const cookieDeviceId = req.cookies[DEVICE_ID_COOKIE.name];
	const sessionDeviceId = fingerprint?.deviceId;

	Logger.log(`cookieDeviceId:\n ${cookieDeviceId}`, 'debug', true);
	Logger.log(`sessionDeviceId: \n ${sessionDeviceId}`, 'debug', true);

	const cookieCheck = deviceIdSchema.safeParse(cookieDeviceId);
	const sessionCheck = deviceIdSchema.safeParse(sessionDeviceId);

	if (!cookieCheck.success || !sessionCheck.success) {
		Logger.log(
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

		req.session.destroy((err) => {
			if (err) {
				Logger.log(`Error destroying session: ${err.message}`, 'error');
			}
			Logger.log(
				`Session destroyed due to fingerprint validation failure for path: ${req.path}`,
				'info'
			);
		});

		return next(
			new AuthenticationError({
				errorCode: 'NOT_AUTHENTICATED',
				message: translate('auth.errors.NOT_AUTHENTICATED'),
				data: {
					authErrors: {isAuthenticated: false},
				},
			})
		);
	}

	if (cookieCheck.data !== sessionCheck.data) {
		Logger.log(
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

		req.session.destroy((err) => {
			if (err) {
				Logger.log(`Error destroying session: ${err.message}`, 'error');
			}
			Logger.log(
				`Session destroyed due to fingerprint validation failure for path: ${req.path}`,
				'info'
			);
		});

		return next(
			new AuthenticationError({
				errorCode: 'NOT_AUTHENTICATED',
				message: translate('auth.errors.NOT_AUTHENTICATED'),
				data: {
					authErrors: {isAuthenticated: true},
				},
			})
		);
	}

	return next();
};

// I need to add some support for the IP checking later
