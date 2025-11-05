import type {paginationQueryDto} from '../types/pagination.ts';
import type {AdminCreateUserDto, AdminUpdateUserDto} from '../types/admin.ts';
import prisma from '../prisma.ts';
import * as Logger from '../helpers/logger.ts';
import {
	parsePaginationQuery,
	getPaginationMetadata,
} from '../helpers/pagination.ts';
import {
	ADMIN_USERNAME,
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	TIME_ZONE,
	LOCALE,
} from '../configs/basic.ts';
import {createUsernameShorthand} from './authService.ts';
import {hashPassword} from '../helpers/password.ts';
import * as AuthService from './authService.ts';
import * as UserService from './userService.ts';
import * as SessionService from './sessionService.ts';
import {ConflictError} from '../lib/domainError.ts';

export const createInitialAdminAccount = async () => {
	try {
		const admin = await prisma.user.findFirst({
			where: {role: 'ADMIN'},
		});
		if (admin) {
			return;
		}

		const usernameShorthand = createUsernameShorthand(ADMIN_USERNAME);
		const hashedPassword = await hashPassword(ADMIN_PASSWORD);

		await prisma.user.create({
			data: {
				name: 'Administrador',
				username: ADMIN_USERNAME.toLowerCase(),
				usernameToDisplay: ADMIN_USERNAME,
				usernameShorthand: usernameShorthand,
				email: ADMIN_EMAIL.toLowerCase(),
				role: 'ADMIN',
				timezone: TIME_ZONE,
				locale: LOCALE,
				isEnabled: true,
				auth: {
					create: {
						password: hashedPassword,
						hasPassword: true,
					},
				},
				emailVerification: {
					create: {
						isEmailVerified: true,
					},
				},
			},
		});

		Logger.logToConsole('Initial admin account successfully created');
	} catch (error) {
		Logger.logToConsole('Initial admin account creation failed');
		Logger.logToFile(error, 'error');
	}
};

export const getUsers = async (query: paginationQueryDto) => {
	const {where, select, orderBy, skipCount, pageSize, pageNumber} =
		await parsePaginationQuery({
			query: query,
			defaultFilter: {role: 'USER'},
		});

	const [results, totalItems] = await Promise.all([
		await prisma.user.findMany({
			where,
			...(select && {
				select: {
					...select,
					emailVerification: {
						select: {isEmailVerified: true},
					},
				},
			}),
			orderBy,
			skip: skipCount,
			take: pageSize,
		}),
		await prisma.user.count({where}),
	]);

	if (totalItems === 0) {
		return {
			users: [],
		};
	}

	const pagination = getPaginationMetadata(totalItems, pageNumber, pageSize);

	return {
		users: results,
		pagination: pagination,
	};
};

export const handleUserCreation = async (data: AdminCreateUserDto) => {
	await AuthService.assertUsernameDoesNotExists(data.username);
	await AuthService.assertEmailDoesNotExists(data.email);

	const usernameShorthand = createUsernameShorthand(data.username);
	const hashedPassword = await hashPassword(data.password);

	const useEmailVerification = data.shouldSendEmailVerification;

	const emailVerificationToken = useEmailVerification
		? AuthService.generateEmailVerificationToken()
		: null;

	await prisma.user.create({
		data: {
			name: data.username,
			username: data.username.toLowerCase(),
			usernameToDisplay: data.username,
			usernameShorthand: usernameShorthand,
			email: data.email.toLowerCase(),
			role: data.role,
			isEnabled: data.isEnabled,
			timezone: TIME_ZONE,
			locale: LOCALE,
			auth: {
				create: {
					password: hashedPassword,
					hasPassword: true,
				},
			},
			...(useEmailVerification && {
				emailVerification: {
					create: {
						isEmailVerified: false,
						emailVerificationToken: emailVerificationToken,
						emailVerificationTokenExpiresAt: emailVerificationToken
							? new Date(Date.now() + 24 * 60 * 60 * 1000)
							: null,
					},
				},
			}),
		},
	});

	if (useEmailVerification && emailVerificationToken) {
		AuthService.sendEmailVerificationToken({
			email: data.email,
			emailVerificationToken: emailVerificationToken,
		});
	}
};

export const handleUserUpdate = async (data: AdminUpdateUserDto) => {
	const user = await UserService.getUserById(data.userId);

	if (user.username !== data.username) {
		await AuthService.assertUsernameDoesNotExists(data.username);
	}

	if (user.email !== data.email) {
		await AuthService.assertEmailDoesNotExists(data.email);
	}

	const useEmailVerification = data.shouldSendEmailVerification;

	const emailVerificationToken = useEmailVerification
		? AuthService.generateEmailVerificationToken()
		: null;

	const usernameShorthand = createUsernameShorthand(data.username);
	const newpassword = data.password
		? await hashPassword(data.password)
		: undefined;

	await prisma.user.update({
		where: {id: data.userId},
		data: {
			name: data.username,
			username: data.username.toLowerCase(),
			usernameToDisplay: data.username,
			usernameShorthand: usernameShorthand,
			email: data.email.toLowerCase(),
			role: data.role,
			isEnabled: data.isEnabled,
			...(newpassword && {
				auth: {
					update: {
						password: newpassword,
						hasPassword: true,
					},
				},
			}),
			...(useEmailVerification && {
				emailVerification: {
					update: {
						isEmailVerified: false,
						emailVerificationToken: emailVerificationToken,
						emailVerificationTokenExpiresAt: emailVerificationToken
							? new Date(Date.now() + 24 * 60 * 60 * 1000)
							: null,
					},
				},
			}),
		},
	});

	if (useEmailVerification && emailVerificationToken) {
		AuthService.sendEmailVerificationToken({
			email: data.email,
			emailVerificationToken: emailVerificationToken,
		});
	}
};

export const handleUserDeletion = async (userId: string) => {
	const user = await UserService.getUserById(userId);
	if (user.role === 'ADMIN') {
		throw new ConflictError({
			messageKey: 'user.errors.CANNOT_DELETE_ADMIN_USER',
		});
	}

	await prisma.user.delete({
		where: {id: userId},
	});

	await SessionService.deleteUserSessions(userId);
};
