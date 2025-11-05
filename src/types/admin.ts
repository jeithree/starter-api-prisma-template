import {z} from 'zod';
import {NOT_ALLOWED_USERNAMES} from '../configs/basic.ts';

export const adminCreateUserSchema = z.object({
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
	role: z.enum(['USER', 'ADMIN', 'MANAGER'], 'validation.INVALID_ROLE'),
	isEnabled: z.boolean('validation.IS_ENABLED_FIELD_REQUIRED'),
	shouldSendEmailVerification: z.boolean(
		'validation.SHOULD_SEND_EMAIL_VERIFICATION_FIELD_REQUIRED'
	),
});
export type AdminCreateUserDto = z.infer<typeof adminCreateUserSchema>;

export const adminUpdateUserSchema = z.object({
	userId: z.string('validation.USER_ID_FIELD_REQUIRED'),
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
		.refine((val) => !val.includes('<script>'), 'validation.NO_SCRIPT_ALLOWED')
		.optional(),
	role: z.enum(['USER', 'ADMIN', 'MANAGER'], 'validation.INVALID_ROLE'),
	isEnabled: z.boolean('validation.IS_ENABLED_FIELD_REQUIRED'),
	shouldSendEmailVerification: z.boolean(
		'validation.SHOULD_SEND_EMAIL_VERIFICATION_FIELD_REQUIRED'
	),
});
export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;

export const adminDeleteUserSchema = z.object({
	userId: z.string('validation.USER_ID_FIELD_REQUIRED'),
});
export type AdminDeleteUserDto = z.infer<typeof adminDeleteUserSchema>;
