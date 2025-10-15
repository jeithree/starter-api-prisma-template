import {z} from 'zod';

export const userUpdatePasswordSchema = z
	.object({
		password: z
			.string('validation.PASSWORD_FIELD_REQUIRED')
			.min(1, 'validation.PASSWORD_FIELD_REQUIRED')
			.refine((val) => val.trim() !== '', 'validation.PASSWORD_FIELD_EMPTY')
			.refine(
				(val) => !val.includes('<script>'),
				'validation.NO_SCRIPT_ALLOWED'
			),
		newpassword: z
			.string('validation.NEWPASSWORD_FIELD_REQUIRED')
			.min(8, 'validation.INVALID_NEWPASSWORD')
			.refine((val) => /[a-z]/.test(val), 'validation.INVALID_NEWPASSWORD')
			.refine((val) => /[A-Z]/.test(val), 'validation.INVALID_NEWPASSWORD')
			.refine((val) => /[0-9]/.test(val), 'validation.INVALID_NEWPASSWORD')
			.refine((val) => /[^a-zA-Z0-9]/.test(val), 'validation.INVALID_NEWPASSWORD')
			.refine(
				(val) => !val.includes('<script>'),
				'validation.NO_SCRIPT_ALLOWED'
			),
		confirmpassword: z
			.string('validation.CONFIRMPASSWORD_FIELD_REQUIRED')
			.min(1, 'validation.CONFIRMPASSWORD_FIELD_REQUIRED')
			.refine(
				(val) => val.trim() !== '',
				'validation.CONFIRMPASSWORD_FIELD_EMPTY'
			)
			.refine(
				(val) => !val.includes('<script>'),
				'validation.NO_SCRIPT_ALLOWED'
			),
	})
	.superRefine((data, ctx) => {
		if (data.confirmpassword !== data.newpassword) {
			ctx.addIssue({
				code: 'custom',
				message: 'validation.PASSWORD_MISMATCH',
				path: ['confirmpassword'],
			});
		}
	});

export type UserUpdatePasswordDto = z.infer<typeof userUpdatePasswordSchema>;

export const userForAdminResponseSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		username: z.string(),
		usernameShorthand: z.string(),
		email: z.email(),
		gender: z.string().optional(),
		birthday: z.date().optional(),
		isEmailVerified: z.boolean(),
		hasPassword: z.boolean(),
		failedLoginAttempts: z.number(),
		isAccountBlocked: z.boolean(),
		accountBlockEndsTime: z.date(),
		accountBlockTimeNumber: z.union([
			z.literal(0),
			z.literal(10),
			z.literal(24),
		]),
		role: z.enum(['user', 'admin', 'moderator']),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.partial();

export type UserForAdminResponseDto = z.infer<
	typeof userForAdminResponseSchema
>;
