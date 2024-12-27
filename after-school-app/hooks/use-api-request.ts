// hooks/use-api-request.ts
'use client'

import { useCallback } from 'react';
import { toast } from './use-toast';
import { convertData } from '@/lib/utils';

const BASE_API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as const,
};

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
  return useCallback(async <T = never>(
    url: string,
    options: RequestInit,
    successMessage?: SuccessMessage
  ): Promise<AppResponse<T>> => {
    try {
      const response = await fetch(url, {
        ...BASE_API_CONFIG,
        ...options,
      });

      const rawData = await response.json();
      const data = convertData<AppResponse<T>>(rawData);

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
        toast({
          title: successMessage.title,
          description: successMessage.description,
        });
      }

      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "錯誤",
        description: error instanceof Error ? error.message : "操作失敗",
      });
      throw error;
    }
  }, []);
};