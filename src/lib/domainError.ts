import type {ApiErrorData} from '../types/shared/apiResponse.ts';

type DomainErrorConfig = {
	message: string;
    errorCode: string;
	shouldRedirect?: boolean;
	redirectUrl?: string;
	data?: ApiErrorData; // now all errors should follow the same data structure
};

type NotFoundErrorConfig = DomainErrorConfig;
type AuthenticationErrorConfig = DomainErrorConfig;
type RateLimitErrorConfig = DomainErrorConfig;
type ConflictErrorConfig = DomainErrorConfig;
type ValidationErrorConfig = DomainErrorConfig;
type ForbiddenErrorConfig = DomainErrorConfig;
type ServerErrorConfig = DomainErrorConfig;

class DomainError extends Error {
	statusCode;
	message;
    errorCode;
	shouldRedirect;
	redirectUrl;
	data;

	constructor(
		statusCode: number,
		message: string,
        errorCode: string,
		shouldRedirect = false,
		redirectUrl = '',
		data: ApiErrorData | undefined = undefined
	) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
        this.errorCode = errorCode;
		this.shouldRedirect = shouldRedirect;
		this.redirectUrl = redirectUrl;
		this.data = data;
		this.name = this.constructor.name;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

// 404 - Not Found errors
export class NotFoundError extends DomainError {
	constructor(config: NotFoundErrorConfig) {
		const {
			message,
            errorCode,
			shouldRedirect = false,
			redirectUrl = '',
			data = undefined,
		} = config;
		super(404, message, errorCode, shouldRedirect, redirectUrl, data);
	}
}

// 401 - Authentication errors
export class AuthenticationError extends DomainError {
	constructor(config: AuthenticationErrorConfig) {
		const {
			message,
            errorCode,
			shouldRedirect = false,
			redirectUrl = '',
			data = undefined,
		} = config;
		super(401, message, errorCode, shouldRedirect, redirectUrl, data);
	}
}

// 429 - Rate Limit errors
export class RateLimitError extends DomainError {
	constructor(config: RateLimitErrorConfig) {
		const {
			message,
            errorCode,
			shouldRedirect = false,
			redirectUrl = '',
			data = undefined,
		} = config;
		super(429, message, errorCode, shouldRedirect, redirectUrl, data);
	}
}

// 409 - Conflict errors
export class ConflictError extends DomainError {
	constructor(config: ConflictErrorConfig) {
		const {
			message,
            errorCode,
			shouldRedirect = false,
			redirectUrl = '',
			data = undefined,
		} = config;
		super(409, message, errorCode, shouldRedirect, redirectUrl, data);
	}
}

// 400 - Bad Request errors
export class ValidationError extends DomainError {
	constructor(config: ValidationErrorConfig) {
		const {
			message,
            errorCode,
			shouldRedirect = false,
			redirectUrl = '',
			data = undefined,
		} = config;
		super(400, message, errorCode, shouldRedirect, redirectUrl, data);
	}
}

// 403 - Forbidden errors
export class ForbiddenError extends DomainError {
	constructor(config: ForbiddenErrorConfig) {
		const {
			message,
            errorCode,
			shouldRedirect = false,
			redirectUrl = '',
			data = undefined,
		} = config;
		super(403, message, errorCode, shouldRedirect, redirectUrl, data);
	}
}

// 500 - Internal Server errors
export class ServerError extends DomainError {
	constructor(config: ServerErrorConfig) {
		const {
			message,
            errorCode,
			shouldRedirect = false,
			redirectUrl = '',
			data = undefined,
		} = config;
		super(500, message, errorCode, shouldRedirect, redirectUrl, data);
	}
}

export default DomainError;

// Export types for external use
export type {
	DomainErrorConfig,
	NotFoundErrorConfig,
	AuthenticationErrorConfig,
	RateLimitErrorConfig,
	ConflictErrorConfig,
	ValidationErrorConfig,
	ForbiddenErrorConfig,
	ServerErrorConfig,
};
