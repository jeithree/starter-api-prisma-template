import type {Request, Response, NextFunction} from 'express';
import type {paginationQueryDto} from '../types/pagination.ts';
import type {
	AdminCreateUserDto,
	AdminUpdateUserDto,
	AdminDeleteUserDto,
} from '../types/admin.ts';
import * as AdminService from '../services/adminService.ts';
import ApiResponse from '../lib/apiResponse.ts';

export const getUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const query = req.query as paginationQueryDto;
		const data = await AdminService.getUsers(query);
		return res.status(200).json(ApiResponse.success({data}));
	} catch (error) {
		return next(error);
	}
};

export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as AdminCreateUserDto;
		await AdminService.handleUserCreation(data);
		return res.status(201).json(
			ApiResponse.success({
				messageKey: 'user.success.USER_CREATED_BY_ADMIN',
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as AdminUpdateUserDto;
		await AdminService.handleUserUpdate(data);
		return res.status(200).json(
			ApiResponse.success({
				messageKey: 'user.success.USER_UPDATED_BY_ADMIN',
			})
		);
	} catch (error) {
		return next(error);
	}
};

export const deleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const data = req.body as AdminDeleteUserDto;
		await AdminService.handleUserDeletion(data.userId);

		return res.status(200).json(
			ApiResponse.success({
				messageKey: 'user.success.USER_DELETED_BY_ADMIN',
			})
		);
	} catch (error) {
		return next(error);
	}
};
