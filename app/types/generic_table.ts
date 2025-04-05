import { FormStoreConfig } from "@/stores/form-store";
import { z } from "zod";

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

export interface ViewConfig {
  enablePreviewMode?: boolean;
  defaultViewMode?: ViewMode;
}

export interface PermissionConfig<T extends BaseRecord> {
  canEdit: (record: T, userRole: string) => boolean;
  canDelete: (record: T, userRole: string) => boolean;
}

export interface DataTableProps<T extends BaseRecord, S extends z.ZodRawShape> {
  data: T[];
  columns: ColumnConfig<T>[];
  viewConfig?: ViewConfig;
  permissionConfig: PermissionConfig<T>;
  userRole: string;
  schema: FormStoreConfig<S>;
  onInsert: (record: T) => Promise<void>;
  onUpdate: (record: T) => Promise<T>;
  onDelete: (record: T) => Promise<void>;
  isLoading?: boolean;
}

export interface QuickListProps<T extends BaseRecord> {
  data: T[];
  selectedId: string | null;
  onSelect: (record: T) => void;
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  displayField: keyof T;
  subDisplayField: keyof T;
  columns: ColumnConfig<T>[];
}

export interface EnumSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: FieldOption[];
  disabled?: boolean;
}