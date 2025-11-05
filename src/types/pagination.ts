import {z} from 'zod';

export const paginationQuerySchema = z.object({
    search: z.string().optional(), // e.g., 'keyword'
	pageSize: z.string().optional(), // e.g., '10'
	page: z.string().optional(), // e.g., '1'
	sort: z.string().optional(), // e.g., 'createdAt:desc'
});

export type paginationQueryDto = z.infer<typeof paginationQuerySchema>;
