import type {ApiResponseDto} from '../types/apiResponse.ts';
import {translate} from '../helpers/helper.ts';

class ApiResponse {
	constructor() {}

	static #generateErrorCode(messageKey: string) {
		if (
			typeof messageKey !== 'string' ||
			messageKey.trim() === '' ||
			!messageKey.includes('.')
		) {
			return 'UNKNOWN_ERROR';
		}

		const messageParts = messageKey.split('.');
		if (messageParts.length < 2) {
			return 'UNKNOWN_ERROR';
		}

		const codePrefix = messageParts.pop()?.toUpperCase() || 'UNKNOWN_ERROR';
		return codePrefix;
	}

	static success({
		messageKey,
		replacements = {},
		data = null,
	}: {
		messageKey?: string;
		replacements?: Record<string, string>;
		data?: any;
	}) {
		const response: ApiResponseDto = {
			success: true,
		};

		if (messageKey) {
			response.message = translate(messageKey, replacements);
		}

		if (data) {
			response.data = data;
		}

		return response;
	}

	static error({
		messageKey,
		replacements = {},
		data = null,
	}: {
		messageKey: string;
		replacements?: Record<string, string>;
		data?: any;
	}) {
		const response: ApiResponseDto = {
			success: false,
			error: {
				message: translate(messageKey, replacements),
				code: this.#generateErrorCode(messageKey),
			},
		};

		if (response.error && data) {
			response.error.data = data;
		}

		return response;
	}
}

export default ApiResponse;
