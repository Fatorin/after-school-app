// hooks/use-api-request.ts
'use client'

import { useCallback } from 'react';
import { toast } from "sonner";
import { DateFieldsMap } from '@/types/common';
import { convertDates } from '@/lib/data-convert';
import { useAuthStore } from '@/stores/auth-store';

const BASE_API_CONFIG = {
	headers: {
		'Content-Type': 'application/json',
	},
	credentials: 'include' as const,
};

interface ApiRequestParams<T extends object> {
	url: string;
	options?: RequestInit;
	dateFields?: DateFieldsMap<T>;
	successMessage?: SuccessMessage;
}

interface AppResponse<T = never> {
	message: string;
	data?: T extends never ? never : T;
}

interface ApiError {
	message?: string;
	errors?: {
		[key: string]: string[];
	};
	error?: string;
}

interface SuccessMessage {
	title: string;
	description: string;
}

class AuthenticationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AuthenticationError';
	}
}

export const useApiRequest = () => {
	const { setMe, setLoading: setAuthLoading } = useAuthStore();

	return useCallback(async <T extends object = never>({
		url,
		options = {},
		dateFields,
		successMessage
	}: ApiRequestParams<T>): Promise<AppResponse<T>> => {
		let response: Response;
		try {
			response = await fetch(url, {
				...BASE_API_CONFIG,
				...options,
			});
		} catch (networkError) {
			console.error("Network Error:", networkError);
			toast.error("網路錯誤", {
				description: "無法連接到伺服器，請檢查您的網路連線。",
			});
			throw networkError;
		}

		if (response.status === 401) {
			setMe(null);
			setAuthLoading(false);
			toast.error("連線階段已過期", {
				description: "請重新登入。",
			});
			throw new AuthenticationError('登入Token過期或無效');
		}

		let rawData: unknown;
		try {
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				rawData = await response.json();
			} else {
				if (!response.ok) {
					const textBody = await response.text();
					console.error(`Non-JSON error response (${response.status}):`, textBody);
					throw new Error(`伺服器錯誤 (${response.status}): ${response.statusText || '無法讀取錯誤內容'}`);
				} else {
					rawData = { message: '操作成功，但回應非JSON格式' };
				}
			}
		} catch (jsonError) {
			console.error("解析 JSON 回應失敗:", jsonError);
			if (!response.ok) {
				throw new Error(`伺服器錯誤 (${response.status}): 無法解析錯誤回應`);
			} else {
				throw new Error("無法解析伺服器回應");
			}
		}

		if (!response.ok) {
			const errorData = rawData as ApiError;
			let errorMessage = '操作失敗';

			if (response.status === 422 && errorData?.errors) {
				errorMessage = Object.entries(errorData.errors)
					.map(([field, messages]) => `${field}: ${messages.join(', ')}`)
					.join('\n');
			} else {
				errorMessage = errorData?.message || errorData?.error || `請求失敗 (${response.status})`;
			}
			if (!errorMessage || errorMessage === '請求失敗 (' + response.status + ')') {
				errorMessage = `伺服器回應錯誤 (${response.status})`;
			}
			throw new Error(errorMessage);
		}

		const responsePayload = rawData as AppResponse<T>;
		const data: AppResponse<T> = dateFields && responsePayload?.data
			? {
				...responsePayload,
				data: convertDates(responsePayload.data, dateFields) as T | undefined
			}
			: responsePayload;

		if (successMessage) {
			toast.success(successMessage.title, {
				description: successMessage.description,
			});
		}
		return data;

	}, [setMe, setAuthLoading]); // <--- 移除 router 依賴
};

// 在檔案某處（useApiRequest 外部或內部，但建議外部）定義錯誤類別，確保 useCrud 可以 import
export { AuthenticationError };