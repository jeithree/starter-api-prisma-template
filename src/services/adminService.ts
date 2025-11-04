import type {paginationQueryDto} from '../types/pagination.ts';
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
