import {z} from 'zod';
import {NOT_ALLOWED_USERNAMES} from '../configs/basic.ts';
import {paginationQuerySchema} from './pagination.ts';
import {translate} from '../helpers/helper.ts';

export const adminGetUsersSchema = paginationQuerySchema.extend({
	role: z.enum(['USER', 'ADMIN', 'MANAGER']).optional(),
	isEnabled: z.string().optional(),
});
export type AdminGetUsersDto = z.infer<typeof adminGetUsersSchema>;

export const adminCreateUserSchema = z.object({
	username: z
		.string(translate('validation.USERNAME_FIELD_REQUIRED'))
		.min(4, translate('validation.INVALID_USERNAME'))
		.max(60, translate('validation.INVALID_USERNAME'))
		.refine((val) => !val.includes(' '), translate('USERNAME_CONTAINS_SPACES'))
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
	role: z.enum(['USER', 'ADMIN', 'MANAGER'], translate('validation.INVALID_ROLE')),
	isEnabled: z.boolean(translate('validation.IS_ENABLED_FIELD_REQUIRED')),
});
export type AdminCreateUserDto = z.infer<typeof adminCreateUserSchema>;

export const adminUpdateUserSchema = z.object({
	username: z
		.string(translate('validation.USERNAME_FIELD_REQUIRED'))
		.min(4, translate('validation.INVALID_USERNAME'))
		.max(60, translate('validation.INVALID_USERNAME'))
		.refine((val) => !val.includes(' '), translate('USERNAME_CONTAINS_SPACES'))
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
		.union([
			z.literal(''), // Allow empty string
			z
				.string()
				.min(8, translate('validation.INVALID_PASSWORD'))
				.refine((val) => /[a-z]/.test(val), translate('validation.INVALID_PASSWORD'))
				.refine((val) => /[A-Z]/.test(val), translate('validation.INVALID_PASSWORD'))
				.refine((val) => /[0-9]/.test(val), translate('validation.INVALID_PASSWORD'))
				.refine(
					(val) => /[^a-zA-Z0-9]/.test(val),
					translate('validation.INVALID_PASSWORD')
				)
				.refine(
					(val) => !val.includes('<script>'),
					translate('validation.NO_SCRIPT_ALLOWED')
				),
		])
		.optional(),
	role: z.enum(['USER', 'ADMIN', 'MANAGER'], translate('validation.INVALID_ROLE')),
	isEnabled: z.boolean(translate('validation.IS_ENABLED_FIELD_REQUIRED')),
});
export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;

export const adminGetSessionsSchema = paginationQuerySchema.extend({
	role: z.enum(['USER', 'ADMIN', 'MANAGER']).optional(),
	isEnabled: z.string().optional(),
});
export type AdminGetSessionsDto = z.infer<typeof adminGetSessionsSchema>;
