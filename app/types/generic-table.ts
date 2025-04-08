import { FormStore } from "@/stores/form-store";
import { z } from "zod";
import { UseBoundStore, StoreApi } from "zustand";

export type FieldType = 'text' | 'enum' | 'boolean' | 'number' | 'date' | 'password';
export type ViewMode = 'list' | 'preview';

export interface BaseRecord {
  id: string;
}

export interface FieldOption {
  value: number | string;
  label: string;
}

export interface ColumnConfig<T> {
  key: keyof T;
  label: string;
  type?: FieldType;
  options?: FieldOption[];
  multiline?: boolean;
  hidden?: boolean;
  viewOnly?: boolean;
  defaultValue?: unknown;
}

export interface PermissionConfig<T extends BaseRecord> {
  canEdit: (record: T, userRole: string) => boolean;
  canDelete: (record: T, userRole: string) => boolean;
}

export interface DataTableProps<T extends BaseRecord, S extends z.ZodRawShape> {
  data: T[];
  columns: ColumnConfig<T>[];
  permissionConfig: PermissionConfig<T>;
  userRole: string;
  onInsert: (record: T) => Promise<void>;
  onUpdate: (record: T) => Promise<T>;
  onDelete: (record: T) => Promise<void>;
  isLoading?: boolean;
  formStore: UseBoundStore<StoreApi<FormStore<S>>>,
}

export interface EnumSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: FieldOption[];
  disabled?: boolean;
}