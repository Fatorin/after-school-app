import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isValid, parse, parseISO } from "date-fns";
import { FieldType } from "@/types/generic_table";
import { DateFieldsMap } from "@/types/common";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const GetConvertedValue = (fileType: FieldType | undefined, value: unknown) => {
  let convertedValue = value;

  if (fileType === 'number' || fileType === 'enum' && typeof value === 'string') {
    // 如果是空字串，設為 null
    if (value === '') {
      convertedValue = null;
    } else {
      // 將字串轉換為數字
      const numValue = Number(value);
      convertedValue = isNaN(numValue) ? null : numValue;
    }
  }

  return convertedValue;
};

// 日期轉換函數
function convertToDate(value: unknown): Date | undefined {
  if (value === undefined || value === null) return undefined;
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return undefined;

  // 嘗試解析 ISO 格式
  const isoDate = parseISO(value);
  if (isValid(isoDate)) return isoDate;

  // 嘗試解析 MySQL 格式
  const mysqlDate = parse(value, 'yyyy-MM-dd HH:mm:ss', new Date());
  if (isValid(mysqlDate)) return mysqlDate;

  return undefined;
}

// 主要轉換函數
export function convertDates<T extends object>(
  data: unknown,
  dateFields: DateFieldsMap<T>
): T {
  if (Array.isArray(data)) {
    return data.map(item => convertDates(item, dateFields)) as T;
  }

  if (!data || typeof data !== 'object') {
    throw new Error('無效的輸入資料');
  }

  const result = { ...data } as T;

  Object.keys(dateFields).forEach((key) => {
    if (key in result) {
      result[key as keyof T] = convertToDate(result[key as keyof T]) as T[keyof T];
    }
  });

  return result;
}