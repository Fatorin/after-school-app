import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BASE_API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as const,
};