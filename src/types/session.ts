import {z} from 'zod';

export const sessionSchema = z.object({
    userId: z.string(),
	role: z.enum(['USER', 'ADMIN', 'MANAGER']),
	isLogged: z.boolean(),
    lastTouched: z.number().optional(),
	fingerprint: z.object({
		ip: z.string().optional(),
		deviceId: z.uuid(),
	}),
    urlToRedirectOnSuccess: z.string().optional(),
    urlToRedirectOnError: z.string().optional(),
});
export type SessionDto = z.infer<typeof sessionSchema>;

export const deviceIdSchema = z.uuid();
