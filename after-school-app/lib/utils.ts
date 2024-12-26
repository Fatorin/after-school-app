import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const transformDates = <T>(data: T, dateFields: Array<keyof T>): T => {
  const transformed = { ...data };

  dateFields.forEach(field => {
    const value = transformed[field];
    if (value && typeof value === 'string') {
      (transformed[field] as unknown) = new Date(value);
    }
  });

  return transformed;
};

export const BASE_API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as const,
};