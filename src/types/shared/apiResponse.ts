export type ValidationError = {
	field: string;
	message: string;
};

export type ApiError = {
	message: string;
	code: string;
	data?: ValidationError[] | Record<string, unknown>;
};

export type ApiResponseDto<T = unknown> = {
	success: boolean;
	message?: string;
	data?: T;
	error?: ApiError;
};

export type paginationMetadataResponse = {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	nextPage: number | null;
	previousPage: number | null;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};
