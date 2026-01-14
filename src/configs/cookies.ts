import {IS_DEV_MODE} from '../configs/basic.ts';

export const DEVICE_ID_COOKIE = {
	name: '_deviceId',
	options: {
		httpOnly: true,
		secure: IS_DEV_MODE ? false : true,
		sameSite: 'lax' as const,
		path: '/',
	},
	maxAge: 1000 * 60 * 60 * 24 * 30,
};

export const SESSION_COOKIE = {
	name: '_apst.sd',
	options: {
		secure: IS_DEV_MODE ? false : true,
		httpOnly: true,
		sameSite: 'lax' as const,
		path: '/',
	},
	maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

export const STATE_COOKIE_KEY = {
	name: '_apst.oauth.state',
	options: {
		httpOnly: true,
		secure: IS_DEV_MODE ? false : true,
		sameSite: 'lax' as const,
	},
	maxAge: 1000 * 60 * 10,
};

export const CODE_VERIFIER_COOKIE_KEY = {
	name: '_apst.oauth.code_verifier',
	options: {
		httpOnly: true,
		secure: IS_DEV_MODE ? false : true,
		sameSite: 'lax' as const,
	},
	maxAge: 1000 * 60 * 10,
};

export const REDIRECT_ERROR_COOKIE = {
	name: '_apst.redirect.error',
	options: {
		httpOnly: false,
		secure: IS_DEV_MODE ? false : true,
		sameSite: 'lax' as const,
	},
	maxAge: 1000 * 60 * 2,
};
