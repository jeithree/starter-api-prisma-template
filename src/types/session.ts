import {z} from 'zod';

export const sessionSchema = z.object({
    userId: z.string(),
	role: z.enum(['USER', 'ADMIN', 'MANAGER']),
    usernameShorthand: z.string().optional(),
    usernameToDisplay: z.string().optional(),
    email: z.string().optional(),
    avatar: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
	isLogged: z.boolean(),
    lastTouched: z.number().optional(),
	fingerprint: z.object({
		ip: z.string().optional(),
		deviceId: z.uuid(),
	}),
    createdAt: z.string().optional(),
    urlToRedirectOnSuccess: z.string().optional(),
    urlToRedirectOnError: z.string().optional(),
});
export type SessionDto = z.infer<typeof sessionSchema>;

export const deviceIdSchema = z.uuid();
