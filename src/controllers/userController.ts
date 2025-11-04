import type {Request, Response, NextFunction} from 'express';
import type {UserUpdatePasswordDto, UserUpdateProfileDto} from '../types/user.ts';
import * as UserService from '../services/userService.ts';
import ApiResponse from '../lib/apiResponse.ts';

export const getUserProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.session.userId as string;
		const user = await UserService.handleGetUserProfile(userId);
		return res.status(200).json(ApiResponse.success({data: user}));
	} catch (error) {
		return next(error);
	}
};

export const updatePasswordAfterValidatingOldOne = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.session.userId as string;
		const data = req.body as UserUpdatePasswordDto;

		await UserService.handlePasswordUpdateAfterValidatingOldOne(userId, data);

		return res.status(200).json(
			ApiResponse.success({
				messageKey: 'user.success.USER_UPDATED',
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const updateUserProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.session.userId as string;
		const data = req.body as UserUpdateProfileDto;
        const oldAvatar = req.session.avatar;

		await UserService.handleUserProfileUpdate(userId, data, oldAvatar);

		return res.status(200).json(
			ApiResponse.success({
				messageKey: 'user.success.USER_PROFILE_UPDATED',
			})
		);
	} catch (error) {
		return next(error);
	}
};
