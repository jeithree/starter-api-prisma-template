import {z} from 'zod';
import {OAuthClient} from './oAuthClient.ts';
import {
	FB_CLIENT_ID,
	FB_CLIENT_SECRET,
	FB_CALLBACK_URL,
    FB_SCOPE,
	FB_AUTH_URL,
	FB_TOKEN_API_URL,
	FB_USER_API_URL,
} from '../../configs/basic.ts';

export function createFacebookOAuthClient() {
	return new OAuthClient({
		provider: 'facebook',
		clientId: FB_CLIENT_ID,
		clientSecret: FB_CLIENT_SECRET,
		scopes: FB_SCOPE,
		urls: {
			auth: FB_AUTH_URL,
			token: FB_TOKEN_API_URL,
			user: FB_USER_API_URL,
			callback: FB_CALLBACK_URL,
		},
		userInfo: {
			schema: z.object({
				id: z.string(),
				name: z.string(),
				email: z.email(),
			}),
			parser: (user) => ({
				id: user.id,
				name: user.name,
				email: user.email,
			}),
		},
	});
}

export const facebookUserFetcher = async (
	userUrl: string,
	accessToken: string,
	_tokenType: string
): Promise<Response> => {
	const url = new URL(userUrl);
	url.searchParams.append('access_token', accessToken);
	url.searchParams.append('fields', 'id,name,email');
	const response = await fetch(url.toString());
	return response;
};
