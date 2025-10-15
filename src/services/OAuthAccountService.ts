import type {Request, Response} from 'express';
import {generateFromEmail} from 'unique-username-generator';
import {createUsernameShorthand} from './authService.ts';
import prisma from '../prisma.ts';
import {oAuthProviderSchema} from '../types/oauth.ts';
import {AuthenticationError} from '../lib/domainError.ts';
import {OAuthClient} from '../lib/oauth/oAuthClient.ts';

const getUserByUsername = async (username: string) => {
	const user = await prisma.user.findUnique({
		where: {username: username},
	});
	return user;
};

const generateUsername = async (email: string) => {
	let isUsernameWithoutNumbersAvailable = false;
	let isUsernameAvailable = false;
	let randomUsername = email;

	while (!isUsernameWithoutNumbersAvailable) {
		randomUsername = generateFromEmail(email, 0);
		const user = await getUserByUsername(randomUsername);
		if (user) {
			while (!isUsernameAvailable) {
				randomUsername = generateFromEmail(email, 3);
				const user = await getUserByUsername(randomUsername);
				if (!user) {
					isUsernameAvailable = true;
				}
			}
			break;
		} else if (!user) {
			isUsernameWithoutNumbersAvailable = true;
		}
	}

	return randomUsername;
};

const connectUserToAccount = async (
	provider: string,
	{id, name, email}: {id: string; name: string; email: string}
) => {
	const emailToLowerCase = email.toLowerCase();
	const providerToLowerCase = provider.toLowerCase();

	// Check if OAuth account already exists
	const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
		where: {
			provider_providerUserId: {
				provider: providerToLowerCase,
				providerUserId: id,
			},
		},
		include: {
			user: true,
		},
	});

	// If OAuth account exists, validate ownership
	if (existingOAuthAccount) {
		// If OAuth account belongs to different user (different email), throw error
		if (existingOAuthAccount.user.email !== emailToLowerCase) {
			throw new AuthenticationError({
				messageKey: 'auth.errors.OAUTH_ACCOUNT_ALREADY_LINKED',
				replacements: {provider: provider},
			});
		}

		// OAuth account belongs to same user, return that user
		return existingOAuthAccount.user;
	}

	const user = await prisma.user.findUnique({
		where: {email: emailToLowerCase},
	});

	if (!user) {
		const username = await generateUsername(email);
		const usernameLowerCase = username.toLowerCase();
		const usernameShorthand = createUsernameShorthand(username);

		const user = await prisma.user.create({
			data: {
				name: name,
				username: usernameLowerCase,
				usernameToDisplay: username,
				usernameShorthand: usernameShorthand,
				email: emailToLowerCase,
				role: 'USER',
				isEnabled: true,
				auth: {
					create: {
						hasPassword: false,
					},
				},
				emailVerification: {
					create: {
						isEmailVerified: true,
					},
				},
			},
		});

		return user;
	}

	await prisma.oAuthAccount.create({
		data: {
			provider: providerToLowerCase,
			providerUserId: id,
			userId: user.id,
		},
	});

	return user;
};

export const getOAuhtProviderUrl = (provider: string, res: Response) => {
	const providerCheck = oAuthProviderSchema.safeParse(provider);
	if (!providerCheck.success) {
		throw new AuthenticationError({
			messageKey: 'auth.errors.OAUTH_LOGIN_FAILED',
			shouldRedirect: true,
			replacements: {provider: 'unknown'},
		});
	}

	const OAuthProviderClient = OAuthClient.getOAuthClient(providerCheck.data);
	return OAuthProviderClient.createAuthUrl(res);
};

export const handleOAuthLogin = async (
	provider: string,
	code: string,
	state: string,
	req: Request
) => {
	const providerCheck = oAuthProviderSchema.safeParse(provider);
	if (!providerCheck.success) {
		throw new AuthenticationError({
			messageKey: 'auth.errors.OAUTH_LOGIN_FAILED',
			shouldRedirect: true,
			replacements: {provider: 'unknown'},
		});
	}

	if (typeof code !== 'string' || typeof state !== 'string') {
		throw new AuthenticationError({
			messageKey: 'auth.errors.OAUTH_LOGIN_FAILED',
			shouldRedirect: true,
			replacements: {provider: providerCheck.data},
		});
	}

	const OAuthProviderClient = OAuthClient.getOAuthClient(providerCheck.data);

	try {
		const oAuthUser = await OAuthProviderClient.fetchUser(
			code,
			state,
			req,
			OAuthProviderClient.getUserFetcher(providerCheck.data)
		);
		const user = await connectUserToAccount(provider, oAuthUser);
		return user;
	} catch (error) {
		throw new AuthenticationError({
			messageKey: 'auth.errors.OAUTH_LOGIN_FAILED',
			shouldRedirect: true,
			replacements: {provider: providerCheck.data},
		});
	}
};
