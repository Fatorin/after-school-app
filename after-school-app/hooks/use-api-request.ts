// hooks/use-api-request.ts
'use client'

import { useCallback } from 'react';
import { toast } from "sonner";
import { DateFieldsMap } from '@/types/common';
import { convertDates } from '@/lib/data_convert';

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

export const useApiRequest = () => {
  return useCallback(async <T extends object = never>({
    url,
    options = {},
    dateFields,
    successMessage
  }: ApiRequestParams<T>): Promise<AppResponse<T>> => {
    try {
      const response = await fetch(url, {
        ...BASE_API_CONFIG,
        ...options,
      });

      const rawData = await response.json();

      const data: AppResponse<T> = dateFields && rawData.data
        ? {
          ...rawData,
          data: convertDates(rawData.data, dateFields)
        }
        : rawData;

      if (!response.ok) {
        if (response.status === 422) {
          const errorData = data as ApiError;
          if (errorData.errors) {
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
            throw new Error(errorMessages);
          }
        }
        throw new Error(
          (data as ApiError).message ||
          (data as ApiError).error ||
          '操作失敗'
        );
      }

      if (successMessage) {
        toast.success("successMessage.title", {
          description: successMessage.description,
        });
      }

      return data;
    } catch (error) {
      toast.error("錯誤", {
        description: error instanceof Error ? error.message : "操作失敗",
      });
      throw error;
    }
  }, []);
};