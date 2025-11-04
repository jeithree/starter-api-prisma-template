import type {
	UserUpdatePasswordDto,
	UserUpdateProfileDto,
} from '../types/user.ts';
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

const deleteOldAvatarFile = async (oldAvatar: string) => {
	if (oldAvatar) {
		const fs = await import('node:fs/promises');
		const path = await import('node:path');
		const __dirname = import.meta.dirname;
		const oldAvatarPath = path.join(__dirname, '../public', oldAvatar);
		try {
			await fs.access(oldAvatarPath);
			await fs.unlink(oldAvatarPath);
		} catch (error) {
			// File does not exist or cannot be accessed, ignore the error
		}
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

	return {
		id: user.id,
		username: user.username,
		email: user.email,
		name: user.name,
		usernameToDisplay: user.usernameToDisplay,
		usernameShorthand: user.usernameShorthand,
		gender: user.gender,
		birthday: user.birthday,
		avatar: user.avatar,
		timezone: user.timezone,
		locale: user.locale,
		isEnabled: user.isEnabled,
		role: user.role,
		isEmailVerified: user.emailVerification?.isEmailVerified ?? false,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
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

export const handleUserProfileUpdate = async (
	userId: string,
	data: UserUpdateProfileDto,
	oldAvatar: string | undefined | null
) => {
	const updateData: any = {};

	if (data.name !== undefined) {
		updateData.name = data.name;
	}
	if (data.birthday !== undefined) {
		updateData.birthday = new Date(data.birthday);
	}
	if (data.avatar !== undefined) {
		updateData.avatar = data.avatar;
	}

	await prisma.user.update({
		where: {id: userId},
		data: updateData,
	});

	if (data.avatar && oldAvatar) {
		await deleteOldAvatarFile(oldAvatar);
	}
};
