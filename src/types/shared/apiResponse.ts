export type ValidationError = {
	field: string;
	message: string;
};

export type AuthErrors = {
	isEmailVerified?: boolean;
	email?: string;
	isAuthenticated?: boolean;
	isAuthorized?: boolean;
};

export type ApiErrorData = {
	validationErrors?: ValidationError[];
	authErrors?: AuthErrors;
};

export type ApiError = {
	message: string;
	code: string;
	data?: ApiErrorData;
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

// TODO: add the types from the frontend and enforce them in the api responses
