import type {Request, Response, NextFunction} from 'express';
import type {
	UserCreateDto,
	UserEmailVerificationDto,
	UserEmailDto,
	UserResetPasswordDto,
	UserAuthDto,
} from '../types/auth.ts';
import * as AuthService from '../services/authService.ts';
import ApiResponse from '../lib/apiResponse.ts';
import {initializeAuthSession} from '../helpers/session.ts';
import * as Logger from '../helpers/logger.ts';
import {DEVICE_ID_COOKIE, SESSION_COOKIE} from '../configs/cookies.ts';
import {translate} from '../helpers/helper.ts';

export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as UserCreateDto;
		const user = await AuthService.handleUserCreation({
			data,
			role: 'USER',
			useEmailVerification: true,
		});

		return res.status(201).json(
			ApiResponse.success({
				message: translate('user.success.USER_CREATED'),
				data: {
					isEmailVerified: user.emailVerification?.isEmailVerified,
					email: user.email,
				},
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const verifyUserEmail = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as UserEmailVerificationDto;
		await AuthService.handleEmailVerification(
			data.email,
			data.emailVerificationToken
		);

		return res.status(200).json(
			ApiResponse.success({
				message: translate('user.success.EMAIL_VERIFIED'),
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const sendEmailVerificationToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as UserEmailDto;
		await AuthService.handleSendEmailVerificationToken(data.email);

		return res.status(200).json(
			ApiResponse.success({
				message: translate('email.success.EMAIL_VERIFICATION_TOKEN_SENT'),
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const sendPasswordResetLink = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as UserEmailDto;
		await AuthService.handleSendPasswordResetLink(data.email);

		return res.status(200).json(
			ApiResponse.success({
				message: translate('email.success.PASSWORD_RESET_LINK_SENT'),
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const resetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as UserResetPasswordDto;
		await AuthService.handleResetPassword(data);

		return res.status(200).json(
			ApiResponse.success({
				message: translate('user.success.PASSWORD_UPDATED_FROM_LINK'),
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const adminLogin = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as UserAuthDto;
		const roleToUse = 'ADMIN';

		const loggedUser = await AuthService.handleLogin(data, roleToUse);
		initializeAuthSession(req, res, loggedUser);

		return res
			.status(200)
			.json(
				ApiResponse.success({message: translate('auth.success.LOGIN_SUCCESS')})
			);
	} catch (error) {
		return next(error);
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as UserAuthDto;

		const loggedUser = await AuthService.handleLogin(data);
		initializeAuthSession(req, res, loggedUser);

		return res
			.status(200)
			.json(
				ApiResponse.success({message: translate('auth.success.LOGIN_SUCCESS')})
			);
	} catch (error) {
		return next(error);
	}
};

export const logout = (req: Request, res: Response) => {
	req.session.destroy(async (err) => {
		if (err) {
			await Logger.log(`Error destroying session in logout: ${err}`, 'error');
		}
	});
	res.clearCookie(SESSION_COOKIE.name, SESSION_COOKIE.options);
	res.clearCookie(DEVICE_ID_COOKIE.name, DEVICE_ID_COOKIE.options);

	return res.status(200).json(ApiResponse.success({data: {isLoggedOut: true}}));
};

export const getSession = (req: Request, res: Response) => {
	console.log(req.session);

	return res.status(200).json(
		ApiResponse.success({
			data: {
				isLogged: req.session.isLogged,
				role: req.session.role,
				usernameShorthand: req.session.usernameShorthand,
				usernameToDisplay: req.session.usernameToDisplay,
				email: req.session.email,
				avatar: req.session.avatar,
			},
		})
	);
};
