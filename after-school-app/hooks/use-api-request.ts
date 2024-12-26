// hooks/use-api-request.ts
'use client'

import { useCallback } from 'react';
import { BASE_API_CONFIG } from "@/lib/utils";
import { toast } from './use-toast';

export interface ApiError {
  message?: string;
  errors?: {
    [key: string]: string[];
  };
  error?: string;
}

export interface SuccessMessage {
  title: string;
  description: string;
}

export const useApiRequest = () => {
  return useCallback(async (
    url: string,
    options: RequestInit,
    successMessage?: SuccessMessage
  ) => {
    try {
      const response = await fetch(url, {
        ...BASE_API_CONFIG,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        // 處理 422 錯誤
        if (response.status === 422) {
          const errorData = data as ApiError;

          if (errorData.errors) {
            const errorMessages = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');

            throw new Error(errorMessages);
          }
        }

        // 處理其他錯誤
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