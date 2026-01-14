import crypto from 'crypto';
import type {Request, Response as ExpressResponse} from 'express';
import {z} from 'zod';
import {oAuthTokenSchema} from '../../types/oauth.ts';
import {
	STATE_COOKIE_KEY,
	CODE_VERIFIER_COOKIE_KEY,
} from '../../configs/cookies.ts';
import {AuthenticationError} from '../domainError.ts';
import {createFacebookOAuthClient, facebookUserFetcher} from './facebook.ts';
import {createGoogleOAuthClient, googleUserFetcher} from './google.ts';
import * as Logger from '../../helpers/logger.ts';
import {translate} from '../../helpers/helper.ts';

type OAuthUrls = {
	auth: string;
	token: string;
	user: string;
	callback: string;
};

type OAuthUserInfo<T> = {
	schema: z.ZodSchema<T>;
	parser: (data: T) => {id: string; name: string; email: string};
};

type OAuthClientConfig<T> = {
	provider: string;
	clientId: string;
	clientSecret: string;
	scopes: string[];
	urls: OAuthUrls;
	userInfo: OAuthUserInfo<T>;
};

export class OAuthClient<T> {
	#provider: string;
	#clientId: string;
	#clientSecret: string;
	#scopes: string[];
	#urls: OAuthUrls;
	#userInfo: OAuthUserInfo<T>;
	#tokenSchema = oAuthTokenSchema;

	constructor({
		provider,
		clientId,
		clientSecret,
		scopes,
		urls,
		userInfo,
	}: OAuthClientConfig<T>) {
		this.#provider = provider;
		this.#clientId = clientId;
		this.#clientSecret = clientSecret;
		this.#scopes = scopes;
		this.#urls = urls;
		this.#userInfo = userInfo;
	}

	createAuthUrl(res: ExpressResponse) {
		const state = this.#createState(res);
		const codeVerifier = this.#createCodeVerifier(res);
		const url = new URL(this.#urls.auth);
		url.searchParams.set('client_id', this.#clientId);
		url.searchParams.set('redirect_uri', this.#urls.callback);
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('scope', this.#scopes.join(' '));
		url.searchParams.set('state', state);
		url.searchParams.set('code_challenge_method', 'S256');
		url.searchParams.set(
			'code_challenge',
			crypto.hash('sha256', codeVerifier, 'base64url')
		);
		return url.toString();
	}

	#createState(res: ExpressResponse) {
		res.cookie;
		const state = crypto.randomBytes(64).toString('hex').normalize();
		res.cookie(STATE_COOKIE_KEY.name, state, {
			...STATE_COOKIE_KEY.options,
			maxAge: STATE_COOKIE_KEY.maxAge,
		});
		return state;
	}

	#createCodeVerifier(res: ExpressResponse) {
		const codeVerifier = crypto.randomBytes(64).toString('hex').normalize();
		res.cookie(CODE_VERIFIER_COOKIE_KEY.name, codeVerifier, {
			...CODE_VERIFIER_COOKIE_KEY.options,
			maxAge: CODE_VERIFIER_COOKIE_KEY.maxAge,
		});
		return codeVerifier;
	}

	async fetchUser(
		code: string,
		state: string,
		req: Request,
		userFetcher: (
			userUrl: string,
			accessToken: string,
			tokenType: string
		) => Promise<Response>
	) {
		const isValidState = this.#validateState(state, req);
		if (!isValidState) {
			Logger.log(
				`Invalid state parameter for provider ${this.#provider}`,
				'warn'
			);
			throw new AuthenticationError({
				errorCode: 'OAUTH_LOGIN_FAILED',
				message: translate('auth.errors.OAUTH_LOGIN_FAILED', {
					provider: this.#provider,
				}),
				shouldRedirect: true,
			});
		}

		const {accessToken, tokenType} = await this.#fetchToken(
			code,
			this.#getCodeVerifier(req)
		);

		const response = await userFetcher(this.#urls.user, accessToken, tokenType);

		const data = await response.json();
		const dataCheck = this.#userInfo.schema.safeParse(data);

		if (!dataCheck.success) {
			Logger.log(
				`Invalid user data for provider ${this.#provider}\n ${JSON.stringify(
					data
				)}`,
				'warn',
				true
			);
			throw new AuthenticationError({
				errorCode: 'OAUTH_LOGIN_FAILED',
				message: translate('auth.errors.OAUTH_LOGIN_FAILED', {
					provider: this.#provider,
				}),
				shouldRedirect: true,
			});
		}

		const user = dataCheck.data;
		return this.#userInfo.parser(user);
	}

	async #fetchToken(code: string, codeVerifier: string) {
		const response = await fetch(this.#urls.token, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json',
			},
			body: new URLSearchParams({
				code,
				redirect_uri: this.#urls.callback,
				grant_type: 'authorization_code',
				client_id: this.#clientId,
				client_secret: this.#clientSecret,
				code_verifier: codeVerifier,
			}),
		});

		const data = await response.json();
		const dataCheck = this.#tokenSchema.safeParse(data);

		if (!dataCheck.success) {
			Logger.log(
				`Invalid data token for provider ${this.#provider}\n ${JSON.stringify(
					data
				)}`,
				'warn',
				true
			);
			throw new AuthenticationError({
				errorCode: 'OAUTH_LOGIN_FAILED',
				message: translate('auth.errors.OAUTH_LOGIN_FAILED', {
					provider: this.#provider,
				}),
				shouldRedirect: true,
			});
		}

		return {
			accessToken: dataCheck.data.access_token,
			tokenType: dataCheck.data.token_type,
		};
	}

	static getOAuthClient(provider: string) {
		switch (provider) {
			case 'facebook':
				return createFacebookOAuthClient();
			case 'google':
				return createGoogleOAuthClient();
			default:
				throw new AuthenticationError({
					errorCode: 'OAUTH_LOGIN_FAILED',
					message: translate('auth.errors.OAUTH_LOGIN_FAILED', {
						provider: 'unknown',
					}),
					shouldRedirect: true,
				});
		}
	}

	getUserFetcher(provider: string) {
		switch (provider) {
			case 'facebook':
				return facebookUserFetcher;
			case 'google':
				return googleUserFetcher;
			default:
				throw new AuthenticationError({
					errorCode: 'OAUTH_LOGIN_FAILED',
					message: translate('auth.errors.OAUTH_LOGIN_FAILED', {
						provider: 'unknown',
					}),
					shouldRedirect: true,
				});
		}
	}

	#validateState(state: string, req: Request) {
		const cookieState = req.cookies[STATE_COOKIE_KEY.name];
		return cookieState === state;
	}

	#getCodeVerifier(req: Request) {
		const codeVerifier = req.cookies[CODE_VERIFIER_COOKIE_KEY.name];
		if (!codeVerifier) {
			Logger.log(
				`Code verifier cookie is missing for provider ${this.#provider}`,
				'warn'
			);
			throw new AuthenticationError({
				errorCode: 'OAUTH_LOGIN_FAILED',
				message: translate('auth.errors.OAUTH_LOGIN_FAILED', {
					provider: this.#provider,
				}),
				shouldRedirect: true,
			});
		}
		return codeVerifier;
	}
}
