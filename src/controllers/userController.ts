import type {Request, Response, NextFunction} from 'express';
import type {
	UserUpdatePasswordDto,
} from '../types/user.ts';
import * as UserService from '../services/userService.ts';
import ApiResponse from '../lib/apiResponse.ts';

export const getUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = req.session.id as string;
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
		const userId = req.session.id as string;
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