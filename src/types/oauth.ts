import {z} from 'zod';

export const oAuthProviderSchema = z.enum(['google', 'facebook']);

export const oAuthTokenSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
	expires_in: z.number().optional(),
});
export type OAuthToken = z.infer<typeof oAuthTokenSchema>;
