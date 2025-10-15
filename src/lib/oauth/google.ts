import {z} from 'zod';
import {OAuthClient} from './oAuthClient.ts';
import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_CALLBACK_URL,
    GOOGLE_SCOPE,
	GOOGLE_AUTH_URL,
	GOOGLE_TOKEN_API_URL,
	GOOGLE_USER_API_URL,
} from '../../configs/basic.ts';

export function createGoogleOAuthClient() {
	return new OAuthClient({
		provider: 'google',
		clientId: GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		scopes: GOOGLE_SCOPE,
		urls: {
			auth: GOOGLE_AUTH_URL,
			token: GOOGLE_TOKEN_API_URL,
			user: GOOGLE_USER_API_URL,
			callback: GOOGLE_CALLBACK_URL,
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

export const googleUserFetcher = async (
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
