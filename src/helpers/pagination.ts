import type {paginationQueryDto} from '../types/pagination.ts';
import type {paginationMetadataResponse} from '../types/shared/apiResponse.ts';

const DEFAULT_PAGE_SIZE = 12;

export const parseSortingQuery = (
	sortQuery?: string,
	defaultSort: Record<string, 'asc' | 'desc'> = {createdAt: 'desc'}
): Record<string, 'asc' | 'desc'> => {
	if (sortQuery) {
		const [field, order] = sortQuery.split(':');
		return {[field]: order === 'desc' ? 'desc' : 'asc'};
	}

	return defaultSort;
};

export const getPagination = (query: paginationQueryDto) => {
	const pageSize = query.pageSize
		? parseInt(query.pageSize)
		: DEFAULT_PAGE_SIZE;
	const page = query.page ? parseInt(query.page) : 1;
	const skip = (page - 1) * pageSize;

	return {page, pageSize, skip};
};

export const getPaginationMetadata = (
	totalItems: number,
	page: number,
	pageSize: number
): paginationMetadataResponse => {
	// Ensure inputs are numbers and positive
	const items = Math.max(0, Number(totalItems));
	const currentPage = Math.max(1, Number(page));
	const size = Math.max(1, Number(pageSize));

	// Calculate total pages and round up to ensure all items are covered
	const totalPages = Math.ceil(items / size);

	// Calculate next and previous pages
	const nextPage = currentPage < totalPages ? currentPage + 1 : null;
	const previousPage = currentPage > 1 ? currentPage - 1 : null;

	return {
		totalItems: items,
		totalPages: totalPages,
		currentPage: currentPage,
		nextPage: nextPage,
		previousPage: previousPage,
		hasNextPage: nextPage !== null,
		hasPreviousPage: previousPage !== null,
	};
};
