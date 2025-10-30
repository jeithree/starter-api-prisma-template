import {z} from 'zod';
import {NOT_ALLOWED_USERNAMES} from '../configs/basic.ts';

export const userCreateSchema = z.object({
	username: z
		.string('validation.USERNAME_FIELD_REQUIRED')
		.min(4, 'validation.INVALID_USERNAME')
		.max(60, 'validation.INVALID_USERNAME')
		.refine((val) => !val.includes(' '), 'USERNAME_CONTAINS_SPACES')
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED')
		.refine(
			(val) => {
				const lowerCaseUsername = val.toLowerCase();
				return !NOT_ALLOWED_USERNAMES.some((notAllowed) =>
					lowerCaseUsername.includes(notAllowed)
				);
			},
			{message: 'user.errors.NOT_ALLOWED_USERNAME'}
		),
	email: z
		.email('validation.INVALID_EMAIL')
		.max(65, 'validation.INVALID_EMAIL_LENGTH')
		.transform((val) => val.toLowerCase())
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED'),
	password: z
		.string('validation.PASSWORD_FIELD_REQUIRED')
		.min(8, 'validation.INVALID_PASSWORD')
		.refine((val) => /[a-z]/.test(val), 'validation.INVALID_PASSWORD')
		.refine((val) => /[A-Z]/.test(val), 'validation.INVALID_PASSWORD')
		.refine((val) => /[0-9]/.test(val), 'validation.INVALID_PASSWORD')
		.refine((val) => /[^a-zA-Z0-9]/.test(val), 'validation.INVALID_PASSWORD')
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED'),
	timezone: z.string(),
});
export type UserCreateDto = z.infer<typeof userCreateSchema>;

export const userEmailVerificationSchema = z.object({
	email: z
		.email('validation.INVALID_EMAIL')
		.max(65, 'validation.INVALID_EMAIL_LENGTH')
		.transform((val) => val.toLowerCase())
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED'),
	emailVerificationToken: z
		.string('validation.TOKEN_REQUIRED')
		.min(1, 'validation.TOKEN_REQUIRED')
		.refine((val) => val.trim() !== '', 'validation.TOKEN_FIELD_EMPTY')
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED'),
});
export type UserEmailVerificationDto = z.infer<
	typeof userEmailVerificationSchema
>;

export const userEmailSchema = z.object({
	email: z
		.email('validation.INVALID_EMAIL')
		.max(65, 'validation.INVALID_EMAIL_LENGTH')
		.transform((val) => val.toLowerCase())
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED'),
});
export type UserEmailDto = z.infer<typeof userEmailSchema>;

export const userUpdatePasswordFromResetLinkSchema = z
	.object({
		email: z
			.email('validation.INVALID_EMAIL')
			.max(65, 'validation.INVALID_EMAIL_LENGTH')
			.transform((val) => val.toLowerCase())
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
		token: z
			.string('validation.TOKEN_REQUIRED')
			.min(1, 'validation.TOKEN_REQUIRED')
			.refine((val) => val.trim() !== '', 'validation.TOKEN_FIELD_EMPTY')
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
export type UserUpdatePasswordFromResetLinkDto = z.infer<
	typeof userUpdatePasswordFromResetLinkSchema
>;

export const userAuthSchema = z.object({
	email: z
		.email('validation.INVALID_EMAIL')
		.max(65, 'validation.INVALID_EMAIL_LENGTH')
		.transform((val) => val.toLowerCase())
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED'),
	password: z
		.string('validation.PASSWORD_FIELD_REQUIRED')
		.min(1, 'validation.PASSWORD_FIELD_REQUIRED')
		.refine((val) => val.trim() !== '', 'validation.PASSWORD_FIELD_EMPTY')
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED'),
});
export type UserAuthDto = z.infer<typeof userAuthSchema>;
