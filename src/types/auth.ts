import {z} from 'zod';
import {NOT_ALLOWED_USERNAMES} from '../configs/basic.ts';
import {translate} from '../helpers/helper.ts';

export const userCreateSchema = z.object({
	username: z
		.string(translate('validation.USERNAME_FIELD_REQUIRED'))
		.min(4, translate('validation.INVALID_USERNAME'))
		.max(60, translate('validation.INVALID_USERNAME'))
		.refine((val) => !val.includes(' '), translate('validation.USERNAME_CONTAINS_SPACES'))
		.refine((val) => !val.includes('<script>'), translate('validation.NO_SCRIPT_ALLOWED'))
		.refine(
			(val) => {
				const lowerCaseUsername = val.toLowerCase();
				return !NOT_ALLOWED_USERNAMES.some((notAllowed) =>
					lowerCaseUsername.includes(notAllowed)
				);
			},
			{error: translate('user.errors.NOT_ALLOWED_USERNAME')}
		),
	email: z
		.email(translate('validation.INVALID_EMAIL'))
		.max(65, translate('validation.INVALID_EMAIL_LENGTH'))
		.transform((val) => val.toLowerCase())
		.refine(
			(val) => !val.includes('<script>'),
			translate('validation.NO_SCRIPT_ALLOWED')
		),
	password: z
		.string(translate('validation.PASSWORD_FIELD_REQUIRED'))
		.min(8, translate('validation.INVALID_PASSWORD'))
		.refine((val) => /[a-z]/.test(val), translate('validation.INVALID_PASSWORD'))
		.refine((val) => /[A-Z]/.test(val), translate('validation.INVALID_PASSWORD'))
		.refine((val) => /[0-9]/.test(val), translate('validation.INVALID_PASSWORD'))
		.refine((val) => /[^a-zA-Z0-9]/.test(val), translate('validation.INVALID_PASSWORD'))
		.refine(
			(val) => !val.includes('<script>'),
			translate('validation.NO_SCRIPT_ALLOWED')
		),
	timezone: z.string(),
	locale: z.string(),
});
export type UserCreateDto = z.infer<typeof userCreateSchema>;

export const userEmailVerificationSchema = z.object({
	email: z
		.email(translate('validation.INVALID_EMAIL'))
		.max(65, translate('validation.INVALID_EMAIL_LENGTH'))
		.transform((val) => val.toLowerCase())
		.refine(
			(val) => !val.includes('<script>'),
			translate('validation.NO_SCRIPT_ALLOWED')
		),
	emailVerificationToken: z
		.string(translate('validation.TOKEN_REQUIRED'))
		.min(1, translate('validation.TOKEN_REQUIRED'))
		.refine((val) => val.trim() !== '', translate('validation.TOKEN_FIELD_EMPTY'))
		.refine(
			(val) => !val.includes('<script>'),
			translate('validation.NO_SCRIPT_ALLOWED')
		),
});
export type UserEmailVerificationDto = z.infer<typeof userEmailVerificationSchema>;

export const userEmailSchema = z.object({
	email: z
		.email(translate('validation.INVALID_EMAIL'))
		.max(65, translate('validation.INVALID_EMAIL_LENGTH'))
		.transform((val) => val.toLowerCase())
		.refine(
			(val) => !val.includes('<script>'),
			translate('validation.NO_SCRIPT_ALLOWED')
		),
});
export type UserEmailDto = z.infer<typeof userEmailSchema>;

export const UserResetPasswordSchema = z
	.object({
		email: z
			.email(translate('validation.INVALID_EMAIL'))
			.max(65, translate('validation.INVALID_EMAIL_LENGTH'))
			.transform((val) => val.toLowerCase())
			.refine(
				(val) => !val.includes('<script>'),
				translate('validation.NO_SCRIPT_ALLOWED')
			),
		newpassword: z
			.string(translate('validation.NEWPASSWORD_FIELD_REQUIRED'))
			.min(8, translate('validation.INVALID_NEWPASSWORD'))
			.refine((val) => /[a-z]/.test(val), translate('validation.INVALID_NEWPASSWORD'))
			.refine((val) => /[A-Z]/.test(val), translate('validation.INVALID_NEWPASSWORD'))
			.refine((val) => /[0-9]/.test(val), translate('validation.INVALID_NEWPASSWORD'))
			.refine(
				(val) => /[^a-zA-Z0-9]/.test(val),
				translate('validation.INVALID_NEWPASSWORD')
			)
			.refine(
				(val) => !val.includes('<script>'),
				translate('validation.NO_SCRIPT_ALLOWED')
			),
		confirmpassword: z
			.string(translate('validation.CONFIRMPASSWORD_FIELD_REQUIRED'))
			.min(1, translate('validation.CONFIRMPASSWORD_FIELD_REQUIRED'))
			.refine(
				(val) => val.trim() !== '',
				translate('validation.CONFIRMPASSWORD_FIELD_EMPTY')
			)
			.refine(
				(val) => !val.includes('<script>'),
				translate('validation.NO_SCRIPT_ALLOWED')
			),
		token: z
			.string(translate('validation.TOKEN_REQUIRED'))
			.min(1, translate('validation.TOKEN_REQUIRED'))
			.refine((val) => val.trim() !== '', translate('validation.TOKEN_FIELD_EMPTY'))
			.refine(
				(val) => !val.includes('<script>'),
				translate('validation.NO_SCRIPT_ALLOWED')
			),
	})
	.superRefine((data, ctx) => {
		if (data.confirmpassword !== data.newpassword) {
			ctx.addIssue({
				code: 'custom',
				message: translate('validation.PASSWORD_MISMATCH'),
				path: ['confirmpassword'],
			});
		}
	});
export type UserResetPasswordDto = z.infer<typeof UserResetPasswordSchema>;

export const userAuthSchema = z.object({
	email: z
		.email(translate('validation.INVALID_EMAIL'))
		.max(65, translate('validation.INVALID_EMAIL_LENGTH'))
		.transform((val) => val.toLowerCase())
		.refine(
			(val) => !val.includes('<script>'),
			translate('validation.NO_SCRIPT_ALLOWED')
		),
	password: z
		.string(translate('validation.PASSWORD_FIELD_REQUIRED'))
		.min(1, translate('validation.PASSWORD_FIELD_REQUIRED'))
		.refine((val) => val.trim() !== '', translate('validation.PASSWORD_FIELD_EMPTY'))
		.refine(
			(val) => !val.includes('<script>'),
			translate('validation.NO_SCRIPT_ALLOWED')
		),
});
export type UserAuthDto = z.infer<typeof userAuthSchema>;
