import {z} from 'zod';

export const paginationQuerySchema = z.object({
	filter: z.string().optional(), // e.g., 'username:juan'
	fields: z.string().optional(), // e.g., 'username,email'
	pageSize: z.string().optional(), // e.g., '10'
	page: z.string().optional(), // e.g., '1'
	sort: z.string().optional(), // e.g., 'createdAt:desc'
});

export type paginationQueryDto = z.infer<typeof paginationQuerySchema>;
