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
			.refine(
				(val) => /[^a-zA-Z0-9]/.test(val),
				'validation.INVALID_NEWPASSWORD'
			)
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

export const userUpdateProfileSchema = z.object({
	name: z
		.string('validation.NAME_FIELD_REQUIRED')
		.min(1, 'validation.NAME_FIELD_REQUIRED')
		.refine((val) => val.trim() !== '', 'validation.NAME_FIELD_EMPTY')
		.max(100, 'validation.NAME_FIELD_TOO_LONG')
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED')
		.optional(),

	birthday: z
		.string('validation.BIRTHDAY_FIELD_REQUIRED')
		.refine((val) => {
			const date = new Date(val);
			return !isNaN(date.getTime());
		}, 'validation.INVALID_BIRTHDAY')
		.optional(),
	avatar: z
		.string('validation.INVALID_AVATAR')
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED')
		.optional(),
    timezone: z.string().optional(),
    locale: z.string().optional(),
});

export type UserUpdateProfileDto = z.infer<typeof userUpdateProfileSchema>;
