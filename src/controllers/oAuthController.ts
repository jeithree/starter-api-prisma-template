import type {Request, Response, NextFunction} from 'express';
import DomainError, {ServerError} from '../lib/domainError.ts';
import * as OAuthService from '../services/OAuthAccountService.ts';
import {initializeAuthSession} from '../helpers/session.ts';
import {SITE_URL} from '../configs/basic.ts';
import {translate} from '../helpers/helper.ts';

export const getOAuthProviderUrl = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		req.session.urlToRedirectOnError = req.query.onError
			? `${SITE_URL}${req.query.onError}`
			: SITE_URL;

		req.session.urlToRedirectOnSuccess = req.query.onSuccess
			? `${SITE_URL}${req.query.onSuccess}`
			: SITE_URL;

		const authUrl = OAuthService.getOAuhtProviderUrl(req.params.provider, res);
		console.log({authUrl});
		return res.redirect(authUrl);
	} catch (error) {
		if (error instanceof DomainError) {
			error.redirectUrl = req.session.urlToRedirectOnError || SITE_URL;
			return next(error);
		}

		return next(
			new ServerError({
				errorCode: 'OAUTH_LOGIN_FAILED',
				message: translate('auth.errors.OAUTH_LOGIN_FAILED', {provider: 'unknown'}),
				redirectUrl: req.session.urlToRedirectOnError || SITE_URL,
			})
		);
	}
};

export const loginWithOAuthProvider = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const loggedUser = await OAuthService.handleOAuthLogin(
			req.params.provider,
			req.query.code as string,
			req.query.state as string,
			req
		);
		initializeAuthSession(req, res, loggedUser);
		return res.redirect(req.session.urlToRedirectOnSuccess || SITE_URL);
	} catch (error) {
		if (error instanceof DomainError) {
			error.redirectUrl = req.session.urlToRedirectOnError || SITE_URL;
			return next(error);
		}

		return next(
			new ServerError({
                errorCode: 'OAUTH_LOGIN_FAILED',
				message: translate('auth.errors.OAUTH_LOGIN_FAILED', {provider: 'unknown'}),
				redirectUrl: req.session.urlToRedirectOnError || SITE_URL,
			})
		);
	}
};
