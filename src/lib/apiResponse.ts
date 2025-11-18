import type {ApiResponseDto, ApiErrorData} from '../types/shared/apiResponse.ts';

class ApiResponse {
	constructor() {}

	static success({
		message,
		data = undefined,
	}: {
		message?: string;
		replacements?: Record<string, string>;
		data?: any;
	}) {
		const response: ApiResponseDto = {
			success: true,
		};

		if (message) {
			response.message = message;
		}

		if (data) {
			response.data = data;
		}

		return response;
	}

	static error({
		message,
		errorCode,
		data = undefined,
	}: {
		message: string;
		errorCode: string;
		data?: ApiErrorData;
	}) {
		const response: ApiResponseDto = {
			success: false,
			error: {
				message: message,
				code: errorCode,
			},
		};

		if (response.error && data) {
			response.error.data = data;
		}

		return response;
	}
}

export default ApiResponse;
