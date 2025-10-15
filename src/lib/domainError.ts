type DomainErrorConfig = {
	messageKey: string;
	shouldRedirect?: boolean;
	redirectUrl?: string;
	replacements?: Record<string, string>;
	data?: Record<string, unknown> | unknown[] | unknown | null;
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
	messageKey;
	shouldRedirect;
	redirectUrl;
	replacements;
	data;

	constructor(
		statusCode: number,
		messageKey: string,
		shouldRedirect = false,
		redirectUrl = '',
		replacements: Record<string, string> = {},
		data: Record<string, unknown> | unknown[] | unknown | null
	) {
		super(messageKey);
		this.statusCode = statusCode;
		this.messageKey = messageKey;
		this.shouldRedirect = shouldRedirect;
		this.redirectUrl = redirectUrl;
		this.replacements = replacements;
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
			messageKey,
			shouldRedirect = false,
			redirectUrl = '',
			replacements = {},
			data = null,
		} = config;
		super(404, messageKey, shouldRedirect, redirectUrl, replacements, data);
	}
}

// 401 - Authentication errors
export class AuthenticationError extends DomainError {
	constructor(config: AuthenticationErrorConfig) {
		const {
			messageKey,
			shouldRedirect = false,
			redirectUrl = '',
			replacements = {},
			data = null,
		} = config;
		super(401, messageKey, shouldRedirect, redirectUrl, replacements, data);
	}
}

// 429 - Rate Limit errors
export class RateLimitError extends DomainError {
	constructor(config: RateLimitErrorConfig) {
		const {
			messageKey,
			shouldRedirect = false,
			redirectUrl = '',
			replacements = {},
			data = null,
		} = config;
		super(429, messageKey, shouldRedirect, redirectUrl, replacements, data);
	}
}

// 409 - Conflict errors
export class ConflictError extends DomainError {
	constructor(config: ConflictErrorConfig) {
		const {
			messageKey,
			shouldRedirect = false,
			redirectUrl = '',
			replacements = {},
			data = null,
		} = config;
		super(409, messageKey, shouldRedirect, redirectUrl, replacements, data);
	}
}

// 400 - Bad Request errors
export class ValidationError extends DomainError {
	constructor(config: ValidationErrorConfig) {
		const {
			messageKey,
			shouldRedirect = false,
			redirectUrl = '',
			replacements = {},
			data = null,
		} = config;
		super(400, messageKey, shouldRedirect, redirectUrl, replacements, data);
	}
}

// 403 - Forbidden errors
export class ForbiddenError extends DomainError {
	constructor(config: ForbiddenErrorConfig) {
		const {
			messageKey,
			shouldRedirect = false,
			redirectUrl = '',
			replacements = {},
			data = null,
		} = config;
		super(403, messageKey, shouldRedirect, redirectUrl, replacements, data);
	}
}

// 500 - Internal Server errors
export class ServerError extends DomainError {
	constructor(config: ServerErrorConfig) {
		const {
			messageKey,
			shouldRedirect = false,
			redirectUrl = '',
			replacements = {},
			data = null,
		} = config;
		super(500, messageKey, shouldRedirect, redirectUrl, replacements, data);
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
