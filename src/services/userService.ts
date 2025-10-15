import type {UserUpdatePasswordDto} from '../types/user.ts';
import prisma from '../prisma.ts';
import {AuthenticationError, NotFoundError} from '../lib/domainError.ts';
import {hashPassword, isPasswordValid} from '../helpers/password.ts';

const getUserById = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: {id: userId},
		include: {auth: true},
	});
	if (!user) {
		throw new NotFoundError({
			messageKey: 'user.errors.USER_NOT_FOUND',
		});
	}
	return user;
};

const assertCurrentPasswordIsValid = async (
	hashedPassword: string | null | undefined,
	password: string
) => {
	if (!hashedPassword) {
		throw new AuthenticationError({
			messageKey: 'user.errors.INVALID_CURRENT_PASSWORD',
		});
	}

	const isValid = await isPasswordValid(password, hashedPassword);

	if (!isValid) {
		throw new AuthenticationError({
			messageKey: 'user.errors.INVALID_CURRENT_PASSWORD',
		});
	}
};

export const handleGetUserProfile = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: {id: userId},
		include: {
			emailVerification: {select: {isEmailVerified: true}},
		},
	});
	if (!user) {
		throw new NotFoundError({
			messageKey: 'user.errors.USER_NOT_FOUND',
		});
	}

	return user;
};

export const handlePasswordUpdateAfterValidatingOldOne = async (
	userId: string,
	data: UserUpdatePasswordDto
) => {
	const user = await getUserById(userId);
	await assertCurrentPasswordIsValid(user.auth?.password, data.password);
	const hashedPassword = await hashPassword(data.newpassword);

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
		prisma.recoverPassword.update({
			where: {userId: user.id},
			data: {
				recoverPasswordToken: null,
				recoverPasswordTokenExpiresAt: null,
			},
		}),
	]);
};
