import type {paginationQueryDto} from '../types/pagination.ts';

type paginationMetadataResponse = {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	nextPage: number | null;
	previousPage: number | null;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export const parsePaginationQuery = async ({
	query = {},
	defaultFilter = {},
	defaultSort = {createdAt: 'desc'},
	excludedFields = [],
}: {
	query: paginationQueryDto;
	defaultFilter?: Record<string, any>;
	defaultSort?: Record<string, 'asc' | 'desc'>;
	excludedFields?: string[];
}) => {
	const pageSize = query.pageSize ? parseInt(query.pageSize) : 12;
	const pageNumber = query.page ? parseInt(query.page) : 1;
	const skipCount = (pageNumber - 1) * pageSize;

	// ----- Filter -----
	let where: Record<string, any> = {...defaultFilter};
	if (query.filter) {
		const filters = query.filter.split(',');
		for (const filterField of filters) {
			const [field, value] = filterField.split(':');
			if (field && value && !excludedFields.includes(field)) {
				where[field] = {contains: value};
			}
		}
	}

	// ----- Field Selection -----
	let select: Record<string, boolean> | undefined;
	if (query.fields) {
		const fieldsArray = query.fields.split(',');
		select = {};
		for (const field of fieldsArray) {
			if (!excludedFields.includes(field)) select[field] = true;
		}
	}

	// ----- Sorting -----
	let orderBy = defaultSort;
	if (query.sort) {
		const [field, order] = query.sort.split(':');
		if (!excludedFields.includes(field)) {
			orderBy = {[field]: order === 'desc' ? 'desc' : 'asc'};
		}
	}

	return {
		where,
		select,
		orderBy,
		skipCount,
		pageSize,
        pageNumber,
	};
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
