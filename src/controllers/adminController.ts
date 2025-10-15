import type {Request, Response, NextFunction} from 'express';
import type {paginationQueryDto} from '../types/pagination.ts';
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
