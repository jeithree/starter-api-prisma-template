import {type Request, type Response} from 'express';
import {type User} from '@prisma/client';
import {v4 as uuidv4} from 'uuid';
import {DEVICE_ID_COOKIE, SESSION_COOKIE} from '../configs/cookies.ts';

export const initializeAuthSession = (
	req: Request,
	res: Response,
	user: User
) => {
	const session = req.session;
	session.userId = user.id;
	session.role = user.role;
    session.usernameToDisplay = user.usernameToDisplay;
    session.email = user.email;
    session.picture = user.picture;
    session.isLogged = true;
	session.cookie.maxAge = SESSION_COOKIE.maxAge;

	const deviceId = uuidv4();

	session.fingerprint = {
		ip: req.ip,
		deviceId: deviceId,
	};

	res.cookie(DEVICE_ID_COOKIE.name, deviceId, {
		...DEVICE_ID_COOKIE.options,
		maxAge: DEVICE_ID_COOKIE.maxAge,
	});
};
