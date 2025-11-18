import {z} from 'zod';
import {translate} from '../helpers/helper.ts';

export const userUpdatePasswordSchema = z
	.object({
		password: z
			.string(translate('validation.PASSWORD_FIELD_REQUIRED'))
			.min(1, translate('validation.PASSWORD_FIELD_REQUIRED'))
			.refine((val) => val.trim() !== '', translate('validation.PASSWORD_FIELD_EMPTY'))
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

export type UserUpdatePasswordDto = z.infer<typeof userUpdatePasswordSchema>;

export const userUpdateProfileSchema = z.object({
	name: z
		.string(translate('validation.NAME_FIELD_REQUIRED'))
		.min(1, translate('validation.NAME_FIELD_REQUIRED'))
		.refine((val) => val.trim() !== '', translate('validation.NAME_FIELD_EMPTY'))
		.max(100, translate('validation.NAME_FIELD_TOO_LONG'))
		.refine((val) => !val.includes('<script>'), translate('validation.NO_SCRIPT_ALLOWED'))
		.optional(),

	birthday: z
		.string(translate('validation.BIRTHDAY_FIELD_REQUIRED'))
		.refine((val) => {
			const date = new Date(val);
			return !isNaN(date.getTime());
		}, translate('validation.INVALID_BIRTHDAY'))
		.optional(),
	avatar: z
		.string(translate('validation.INVALID_AVATAR'))
		.refine((val) => !val.includes('<script>'), translate('validation.NO_SCRIPT_ALLOWED'))
		.optional(),
	timezone: z.string().optional(),
	locale: z.string().optional(),
});

export type UserUpdateProfileDto = z.infer<typeof userUpdateProfileSchema>;
