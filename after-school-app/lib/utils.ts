import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isValid, parse, parseISO } from "date-fns";
import { FieldType } from "@/types/generic_table";

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

// 轉換資料中的日期字串為 Date 物件
export function convertData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // 嘗試將字串解析為日期
    const isoDate = parseISO(data);
    if (isValid(isoDate)) {
      return isoDate as unknown as T;
    }
    // 如果不是有效的 ISO 格式，嘗試解析其他格式
    const mysqlDate = parse(data, 'yyyy-MM-dd HH:mm:ss', new Date());
    if (isValid(mysqlDate)) {
      return mysqlDate as unknown as T;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => convertData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const converted = Object.fromEntries(
      Object.entries(data as object).map(([key, value]) => [
        key,
        convertData(value)
      ])
    );
    return converted as T;
  }

  return data;
}