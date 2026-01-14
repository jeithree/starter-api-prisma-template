import {
	type UserAuthDto,
	type UserCreateDto,
	type UserResetPasswordDto,
} from '../types/auth.ts';
import {type User} from '@prisma/client';
import {v4 as uuidv4} from 'uuid';
import {DateTime} from 'luxon';
import prisma from '../prisma.ts';
import MailManager from '../lib/mailManager.ts';
import QueueManager from '../lib/queueManager.ts';
import {hashPassword, isPasswordValid} from '../helpers/password.ts';
import {
	AuthenticationError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	ServerError,
} from '../lib/domainError.ts';
import * as Logger from '../helpers/logger.ts';
import {
	SITE_NAME,
	EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS,
	PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES,
	SITE_URL,
	LOGIN_ATTEMPTS_FOR_10_MINUTES_BLOCK,
	LOGIN_ATTEMPTS_FOR_24_HOURS_BLOCK,
} from '../configs/basic.ts';
import {translate} from '../helpers/helper.ts';

QueueManager.createQueue('verificationEmailQueue', {
	concurrency: 10,
});
QueueManager.createQueue('passwordResetEmailQueue', {
	concurrency: 10,
});

export const assertUsernameDoesNotExists = async (username: string) => {
	const usernameToLowerCase = username.toLowerCase();

	const usernameFound = await prisma.user.findUnique({
		where: {
			username: usernameToLowerCase,
		},
	});

	if (usernameFound) {
		throw new ConflictError({
			errorCode: 'USERNAME_ALREADY_TAKEN',
			message: translate('user.errors.USERNAME_ALREADY_TAKEN'),
			data: {
				validationErrors: [
					{
						field: 'username',
						message: translate('user.errors.USERNAME_ALREADY_TAKEN'),
					},
				],
			},
		});
	}
};

export const assertEmailDoesNotExists = async (email: string) => {
	const emailToLowerCase = email.toLowerCase();

	const user = await prisma.user.findUnique({
		where: {email: emailToLowerCase},
	});

	if (user) {
		throw new ConflictError({
			errorCode: 'EMAIL_ALREADY_EXISTS',
			message: translate('user.errors.EMAIL_ALREADY_EXISTS'),
			data: {
				validationErrors: [
					{
						field: 'email',
						message: translate('user.errors.EMAIL_ALREADY_EXISTS'),
					},
				],
			},
		});
	}
};

const assertEmailIsNotVerified = (
	isEmailVerified: boolean | undefined | null
) => {
	if (isEmailVerified) {
		throw new ConflictError({
			errorCode: 'EMAIL_ALREADY_VERIFIED',
			message: translate('user.errors.EMAIL_ALREADY_VERIFIED'),
			data: {
				validationErrors: [
					{
						field: 'email',
						message: translate('user.errors.EMAIL_ALREADY_VERIFIED'),
					},
				],
			},
		});
	}
};

export const createUsernameShorthand = (username: string) => {
	const usernameShorthand = username.substring(0, 2).toUpperCase();
	return usernameShorthand;
};

export const generateEmailVerificationToken = () => {
	const randomToken = uuidv4();
	const token = randomToken.split('-')[0];
	return token;
};

const createUser = async ({
	data,
	role,
	emailVerificationToken,
	isEmailVerified = false,
	isEnabled = true,
}: {
	data: UserCreateDto;
	role: User['role'];
	emailVerificationToken: string | null;
	isEmailVerified: boolean;
	isEnabled: boolean;
}) => {
	const usernameLowerCase = data.username.toLowerCase();
	const usernameShorthand = createUsernameShorthand(data.username);
	const hashedPassword = await hashPassword(data.password);

	const user = await prisma.user.create({
		data: {
			username: usernameLowerCase,
			usernameToDisplay: data.username,
			usernameShorthand: usernameShorthand,
			email: data.email,
			role: role,
			timezone: data.timezone,
			locale: data.locale,
			isEnabled: isEnabled,
			auth: {
				create: {
					password: hashedPassword,
					hasPassword: true,
				},
			},
			emailVerification: {
				create: {
					isEmailVerified: isEmailVerified,
					emailVerificationToken: emailVerificationToken,
					emailVerificationTokenExpiresAt: emailVerificationToken
						? new Date(
								Date.now() +
									EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
						  )
						: null, // 24 hours from now
				},
			},
		},
		include: {auth: true, emailVerification: true},
	});

	return user;
};

export const sendEmailVerificationToken = ({
	email,
	emailVerificationToken,
}: {
	email: string;
	emailVerificationToken: string;
}) => {
	QueueManager.addToQueue('verificationEmailQueue', async () => {
		try {
			const result = await MailManager.send({
				to: email,
				subject: `Código de verificación de email | ${SITE_NAME}`,
				html: `
                    <html>
                        <body>
                            Tu código de verificación de email es <b>${emailVerificationToken}</b></br>
                            El código solo es valido por ${EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS} minutes.
                        </body>
                    </html>`,
			});

			if (result.messageId === '') {
				Logger.log(
					`Email verification token sending failed for email: ${email}`,
					'info'
				);
			}
		} catch (error) {
			Logger.log(error, 'error');
		}
	});
};

const getUserByEmail = async (email: string) => {
	const emailToLowerCase = email.toLowerCase();
	const user = await prisma.user.findUnique({
		where: {email: emailToLowerCase},
		include: {emailVerification: true, auth: true, resetPassword: true},
	});
	if (!user) {
		throw new NotFoundError({
			errorCode: 'EMAIL_NOT_FOUND',
			message: translate('user.errors.EMAIL_NOT_FOUND'),
			data: {
				validationErrors: [
					{
						field: 'email',
						message: translate('user.errors.EMAIL_NOT_FOUND'),
					},
				],
			},
		});
	}
	return user;
};

const assertEmailVerificationTokenIsValid = (
	DBEmailVerificationToken: string | null | undefined,
	emailVerificationToken: string
) => {
	if (DBEmailVerificationToken !== emailVerificationToken) {
		throw new AuthenticationError({
			errorCode: 'INVALID_EMAIL_VERIFICATION_TOKEN',
			message: translate('user.errors.INVALID_EMAIL_VERIFICATION_TOKEN'),
			data: {
				validationErrors: [
					{
						field: 'emailVerificationToken',
						message: translate('user.errors.INVALID_EMAIL_VERIFICATION_TOKEN'),
					},
				],
			},
		});
	}
};

const assertEmailVerificationTokenIsNotExpired = (
	emailVerificationTokenExpirationDate: Date | null | undefined
) => {
	if (!emailVerificationTokenExpirationDate) {
		throw new AuthenticationError({
			errorCode: 'INVALID_EMAIL_VERIFICATION_TOKEN',
			message: translate('user.errors.INVALID_EMAIL_VERIFICATION_TOKEN'),
		});
	}

	const now = DateTime.utc();
	const expires = DateTime.fromJSDate(emailVerificationTokenExpirationDate, {
		zone: 'utc',
	});

	if (now.toMillis() > expires.toMillis()) {
		throw new AuthenticationError({
			errorCode: 'EMAIL_VERIFICATION_TOKEN_EXPIRED',
			message: translate('user.errors.EMAIL_VERIFICATION_TOKEN_EXPIRED'),
			data: {
				validationErrors: [
					{
						field: 'emailVerificationToken',
						message: translate('user.errors.EMAIL_VERIFICATION_TOKEN_EXPIRED'),
					},
				],
			},
		});
	}
};

const assertEmailVerificationTokenIsExpired = (
	emailVerificationTokenExpirationDate: Date | null | undefined
) => {
	if (!emailVerificationTokenExpirationDate) {
		throw new AuthenticationError({
			errorCode: 'INVALID_EMAIL_VERIFICATION_TOKEN',
			message: translate('user.errors.INVALID_EMAIL_VERIFICATION_TOKEN'),
		});
	}

	const now = DateTime.utc();
	const expires = DateTime.fromJSDate(emailVerificationTokenExpirationDate, {
		zone: 'utc',
	});

	if (now.toMillis() < expires.toMillis()) {
		const hoursLeftToRequestNewEmailVerificationToken = Math.ceil(
			expires.diff(now, 'hours').hours
		);

		throw new ForbiddenError({
			errorCode: 'EMAIL_VERIFICATION_TOKEN_NOT_EXPIRED',
			message: translate('user.errors.EMAIL_VERIFICATION_TOKEN_NOT_EXPIRED', {
				waitTime: String(EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS),
				timeLeft: String(hoursLeftToRequestNewEmailVerificationToken),
				unit: translate(`units.hours`),
			}),
		});
	}
};

const setUserEmailAsVerified = async (userId: string) => {
	try {
		await prisma.emailVerification.upsert({
			where: {userId: userId},
			update: {
				isEmailVerified: true,
				emailVerificationToken: null,
				emailVerificationTokenExpiresAt: null,
			},
			create: {
				userId: userId,
				isEmailVerified: true,
				emailVerificationToken: null,
				emailVerificationTokenExpiresAt: null,
			},
		});
	} catch (error) {
		throw new ServerError({
			errorCode: 'EMAIL_VERIFICATION_FAILED',
			message: translate('user.errors.EMAIL_VERIFICATION_FAILED'),
		});
	}
};

const assertResetPasswordTokenIsExpired = (
	resetPasswordTokenExpirationDate: Date | null | undefined
) => {
	if (
		resetPasswordTokenExpirationDate === null ||
		resetPasswordTokenExpirationDate === undefined
	) {
		return; // No token exists, so it is considered expired
	}

	const now = DateTime.utc();
	const expires = DateTime.fromJSDate(resetPasswordTokenExpirationDate, {
		zone: 'utc',
	});

	if (now.toMillis() < expires.toMillis()) {
		const minutesLeftToRequestNewPasswordResetLink = Math.ceil(
			expires.diff(now, 'minutes').minutes
		);

		throw new ForbiddenError({
			errorCode: 'PASSWORD_RESET_TOKEN_NOT_EXPIRED',
			message: translate('user.errors.PASSWORD_RESET_TOKEN_NOT_EXPIRED', {
				waitTime: String(PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES),
				timeLeft: String(minutesLeftToRequestNewPasswordResetLink),
				unit: translate(`units.minutes`),
			}),
		});
	}
};

const generateResetPasswordToken = () => {
	const token = uuidv4();
	return token;
};

const sendPasswordResetLink = ({
	email,
	resetPasswordToken,
}: {
	email: string;
	resetPasswordToken: string;
}) => {
	QueueManager.addToQueue('passwordResetEmailQueue', async () => {
		try {
			const result = await MailManager.send({
				to: email,
				subject: `Recuperar contraseña | ${SITE_NAME}`,
				html: `
            <html>
                <body>
                    Sigue el siguiente <a href="${SITE_URL}/cambiar-contrasena?email=${email}&token=${resetPasswordToken}">Enlace</a>, para cambiar tu contraseña.</br>
                    El enlace solo es valido por ${PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES} minutos.
                </body>
            </html>`,
			});

			if (result.messageId === '') {
				Logger.log(
					`Password reset link token sending failed for email: ${email}`,
					'info'
				);
			}
		} catch (error) {
			Logger.log(error, 'error');
		}
	});
};

const assertResetPasswordTokenIsValid = (
	DBResetPasswordToken: string | null | undefined,
	resetPasswordToken: string
) => {
	if (DBResetPasswordToken != resetPasswordToken) {
		throw new AuthenticationError({
			errorCode: 'INVALID_PASSWORD_RESET_TOKEN',
			message: translate('user.errors.INVALID_PASSWORD_RESET_TOKEN'),
		});
	}
};

const assertResetPasswordTokenIsNotExpired = (
	resetPasswordTokenExpirationDate: Date | null | undefined
) => {
	if (!resetPasswordTokenExpirationDate) {
		throw new AuthenticationError({
			errorCode: 'INVALID_PASSWORD_RESET_TOKEN',
			message: translate('user.errors.INVALID_PASSWORD_RESET_TOKEN'),
		});
	}

	const now = DateTime.utc();
	const expires = DateTime.fromJSDate(resetPasswordTokenExpirationDate, {
		zone: 'utc',
	});

	if (now.toMillis() > expires.toMillis()) {
		throw new AuthenticationError({
			errorCode: 'PASSWORD_RESET_TOKEN_EXPIRED',
			message: translate('user.errors.PASSWORD_RESET_TOKEN_EXPIRED'),
		});
	}
};

const getUserForLogin = async (
	email: string,
	roleToUse: User['role'] | null | undefined
) => {
	const user = await prisma.user.findFirst({
		where: {
			email: email.toLowerCase(),
			role: roleToUse ? roleToUse : undefined,
			auth: {
				hasPassword: true, // important so the user can't login with email/password('') if they signed up with OAuth
			},
		},
		include: {auth: true, emailVerification: true},
	});

	if (!user) {
		throw new AuthenticationError({
			errorCode: 'INVALID_CREDENTIALS',
			message: translate('auth.errors.INVALID_CREDENTIALS'),
		});
	}

	return user;
};

const assertUserIsNotBlocked = (
	isAccountBlocked: boolean | null | undefined,
	accountBlockEndsTime: Date | null | undefined,
	accountBlockTimeNumber: number | null | undefined
) => {
	if (!isAccountBlocked || !accountBlockEndsTime || !accountBlockTimeNumber) {
		return;
	}

	const now = DateTime.utc();
	const expires = DateTime.fromJSDate(accountBlockEndsTime, {
		zone: 'utc',
	});

	if (isAccountBlocked && now.toMillis() < expires.toMillis()) {
		const blockTime = accountBlockTimeNumber;
		const blockTimeUnit = blockTime === 10 ? 'minutes' : 'hours';

		throw new ForbiddenError({
			errorCode: 'ACCOUNT_BLOCKED',
			message: translate('user.errors.ACCOUNT_BLOCKED', {
				blockTime: String(blockTime),
				blockTimeUnit: translate(`units.${blockTimeUnit}`),
			}),
		});
	}
};

const handlePasswordIsNotValid = async (
	userId: string,
	hashedPassword: string | null | undefined,
	password: string
) => {
	if (!hashedPassword) {
		throw new AuthenticationError({
			errorCode: 'INVALID_CREDENTIALS',
			message: translate('auth.errors.INVALID_CREDENTIALS'),
		});
	}

	const isValid = await isPasswordValid(password, hashedPassword);
	if (!isValid) {
		await handleFailedLoginAttempts(userId);
		throw new AuthenticationError({
			errorCode: 'INVALID_CREDENTIALS',
			message: translate('auth.errors.INVALID_CREDENTIALS'),
		});
	}
};

const handleFailedLoginAttempts = async (userId: string) => {
	const updatedUser = await prisma.auth.update({
		where: {userId: userId},
		data: {
			failedLoginAttempts: {
				increment: 1,
			},
		},
	});

	if (!updatedUser) {
		await Logger.log(
			`Failed to increment failed login attempts for userId: ${userId}`,
			'error'
		);

		throw new ServerError({
			errorCode: 'INTERNAL_SERVER_ERROR',
			message: translate('server.errors.INTERNAL_SERVER_ERROR'),
		});
	}

	const failedAttempts = updatedUser.failedLoginAttempts;

	if (failedAttempts === LOGIN_ATTEMPTS_FOR_10_MINUTES_BLOCK) {
		await blockAccount(updatedUser.id, 10, 'minutes');
	}

	if (failedAttempts === LOGIN_ATTEMPTS_FOR_24_HOURS_BLOCK) {
		await blockAccount(updatedUser.id, 24, 'hours');
	}
};

const blockAccount = async (
	userId: string,
	blockTime: number,
	blockTimeUnit: 'minutes' | 'hours'
) => {
	const now = DateTime.utc();
	const blockEndsTime = now.plus({[blockTimeUnit]: blockTime}).toJSDate();

	const updatedUser = await prisma.auth.update({
		where: {userId: userId},
		data: {
			failedLoginAttempts: 0,
			isAccountBlocked: true,
			accountBlockExpiresAt: blockEndsTime,
			accountBlockTimeNumber: blockTime,
		},
	});

	if (!updatedUser) {
		await Logger.log(`Failed to block account for userId: ${userId}`, 'error');

		throw new ServerError({
			errorCode: 'INTERNAL_SERVER_ERROR',
			message: translate('server.errors.INTERNAL_SERVER_ERROR'),
		});
	}

	throw new ForbiddenError({
		errorCode: 'ACCOUNT_BLOCKED',
		message: translate('user.errors.ACCOUNT_BLOCKED', {
			blockTime: String(blockTime),
			blockTimeUnit: translate(`units.${blockTimeUnit}`),
		}),
	});
};

const handleEmailIsNotVerified = async (
	userId: string,
	isEmailVerified: boolean | undefined | null
) => {
	if (!isEmailVerified) {
		const emailVerificationToken = generateEmailVerificationToken();
		const result = await prisma.emailVerification.upsert({
			where: {userId: userId},
			update: {
				emailVerificationToken: emailVerificationToken,
				emailVerificationTokenExpiresAt: new Date(
					Date.now() +
						EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
				),
			},
			create: {
				userId: userId,
				isEmailVerified: false,
				emailVerificationToken: emailVerificationToken,
				emailVerificationTokenExpiresAt: new Date(
					Date.now() +
						EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
				),
			},
			include: {user: true},
		});

		sendEmailVerificationToken({
			email: result.user.email,
			emailVerificationToken,
		});

		throw new ForbiddenError({
			errorCode: 'EMAIL_NOT_VERIFIED',
			message: translate('auth.errors.EMAIL_NOT_VERIFIED'),
			data: {
				authErrors: {
					isEmailVerified: result.isEmailVerified,
					email: result.user.email,
				},
			},
		});
	}
};

const assertUserIsEnabled = (isEnabled: boolean) => {
	if (!isEnabled) {
		throw new ForbiddenError({
			errorCode: 'ACCOUNT_NOT_ENABLED',
			message: translate('user.errors.ACCOUNT_NOT_ENABLED'),
		});
	}
};

export const handleUserCreation = async ({
	data,
	role,
	useEmailVerification = true,
	useAdminVerification = false,
}: {
	data: UserCreateDto;
	role: User['role'];
	useEmailVerification: boolean;
	useAdminVerification?: boolean;
}) => {
	if (useEmailVerification && useAdminVerification) {
		throw new Error(
			'Cannot use both email verification and admin verification at the same time.'
		);
	}

	if (!useEmailVerification && !useAdminVerification) {
		throw new Error(
			'At least one of email verification or admin verification must be enabled.'
		);
	}

	await assertUsernameDoesNotExists(data.username);
	await assertEmailDoesNotExists(data.email);

	const isEnabled = useAdminVerification ? false : true;
	const isEmailVerified = useEmailVerification ? false : true;
	const emailVerificationToken = useEmailVerification
		? generateEmailVerificationToken()
		: null;

	const user = await createUser({
		data,
		role,
		emailVerificationToken,
		isEmailVerified,
		isEnabled,
	});

	if (useEmailVerification && emailVerificationToken) {
		sendEmailVerificationToken({
			email: user.email,
			emailVerificationToken: emailVerificationToken,
		});
	}

	return user;
};

export const handleEmailVerification = async (
	email: string,
	emailVerificationToken: string
): Promise<void> => {
	const user = await getUserByEmail(email);
	assertEmailIsNotVerified(user.emailVerification?.isEmailVerified);
	assertEmailVerificationTokenIsValid(
		user.emailVerification?.emailVerificationToken,
		emailVerificationToken
	);
	assertEmailVerificationTokenIsNotExpired(
		user.emailVerification?.emailVerificationTokenExpiresAt
	);
	await setUserEmailAsVerified(user.id);
};

export const handleSendEmailVerificationToken = async (email: string) => {
	const user = await getUserByEmail(email);
	assertEmailIsNotVerified(user.emailVerification?.isEmailVerified);
	assertEmailVerificationTokenIsExpired(
		user.emailVerification?.emailVerificationTokenExpiresAt
	);
	const newEmailVerificationToken = generateEmailVerificationToken();
	await prisma.emailVerification.update({
		where: {userId: user.id},
		data: {
			emailVerificationToken: newEmailVerificationToken,
			emailVerificationTokenExpiresAt: new Date(
				Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
			),
		},
	});
	sendEmailVerificationToken({
		email: user.email,
		emailVerificationToken: newEmailVerificationToken,
	});
};

export const handleSendPasswordResetLink = async (email: string) => {
	const user = await getUserByEmail(email);
	assertResetPasswordTokenIsExpired(
		user.resetPassword?.resetPasswordTokenExpiresAt
	);
	const resetPasswordToken = generateResetPasswordToken();
	await prisma.resetPassword.upsert({
		where: {userId: user.id},
		create: {
			userId: user.id,
			resetPasswordToken: resetPasswordToken,
			resetPasswordTokenExpiresAt: new Date(
				Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000
			), // PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES from now
		},
		update: {
			resetPasswordToken: resetPasswordToken,
			resetPasswordTokenExpiresAt: new Date(
				Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000
			), // PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES from now
		},
	});
	sendPasswordResetLink({
		email: user.email,
		resetPasswordToken,
	});
};

export const handleResetPassword = async (data: UserResetPasswordDto) => {
	const user = await getUserByEmail(data.email);
	assertResetPasswordTokenIsValid(
		user.resetPassword?.resetPasswordToken,
		data.token
	);
	assertResetPasswordTokenIsNotExpired(
		user.resetPassword?.resetPasswordTokenExpiresAt
	);

	const hashedPassword = await hashPassword(data.newpassword);
	// do transaction here

	await prisma.$transaction([
		prisma.auth.update({
			where: {userId: user.id},
			data: {
				password: hashedPassword,
				hasPassword: true,
				failedLoginAttempts: 0,
				isAccountBlocked: false,
				accountBlockExpiresAt: null,
				accountBlockTimeNumber: 0,
			},
		}),
		prisma.resetPassword.update({
			where: {userId: user.id},
			data: {
				resetPasswordToken: null,
				resetPasswordTokenExpiresAt: null,
			},
		}),
	]);
};

export const handleLogin = async (
	data: UserAuthDto,
	roleToUse?: User['role']
) => {
	const user = await getUserForLogin(data.email, roleToUse);
	assertUserIsEnabled(user.isEnabled);
	assertUserIsNotBlocked(
		user.auth?.isAccountBlocked,
		user.auth?.accountBlockExpiresAt,
		user.auth?.accountBlockTimeNumber
	);
	await handlePasswordIsNotValid(user.id, user.auth?.password, data.password);
	await handleEmailIsNotVerified(
		user.id,
		user.emailVerification?.isEmailVerified
	);
	const userUpdated = await prisma.auth.update({
		where: {userId: user.id},
		data: {
			failedLoginAttempts: 0,
			isAccountBlocked: false,
			accountBlockExpiresAt: null,
			accountBlockTimeNumber: 0,
		},
	});
	return {...user, auth: userUpdated};
};
