import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BaseRecord, ColumnConfig } from '@/types/generic_table';
import { renderField } from './helper';
import { cn, GetConvertedValue } from '@/lib/utils';
import { FormStore } from "@/stores/form-store";
import { z } from "zod";

type InferSchemaType<S extends z.ZodRawShape> = z.infer<z.ZodObject<S>>;

interface PreviewCardProps<T extends BaseRecord, S extends z.ZodRawShape> {
  record: T | null;
  columns: ColumnConfig<T>[];
  canEdit: (record: T) => boolean;
  canDelete: (record: T) => boolean;
  onUpdate: (record: T) => Promise<T>;
  onDelete: (record: T) => Promise<void>;
  useFormStore: () => FormStore<S>;
}

export function PreviewCard<T extends BaseRecord, S extends z.ZodRawShape>({
  record,
  columns,
  canEdit,
  onUpdate,
  useFormStore
}: PreviewCardProps<T, S>) {
  const {
    values,
    errors,
    isValid,
    setValues,
    setMode,
    validateField,
    validateForm,
  } = useFormStore();

  const [editMode, setEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (record) {
      setMode('update');
      const recordValues = Object.entries(record).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {} as Partial<InferSchemaType<S>>);
      setValues(recordValues);
      setHasChanges(false);
    }
  }, [record, setMode, setValues]);

  if (!record) {
    return (
      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader>
          <CardTitle className="text-muted-foreground">請選擇項目查看詳細資料</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const handleChange = (field: keyof T & keyof InferSchemaType<S>, value: unknown) => {
    const column = columns.find(c => c.key === field);
    const convertedValue = GetConvertedValue(column?.type, value);
    setValues({ [field]: convertedValue } as Partial<InferSchemaType<S>>);
    validateField(field);
    setHasChanges(true);
  };

  const handleUpdate = async () => {
    if (validateForm() && hasChanges) {
      try {
        const submitData = Object.entries(values).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value
        }), {} as T);

        await onUpdate(submitData);
        setHasChanges(false);
        setEditMode(false);
      } catch (error) {
        console.error('更新失敗:', error);
      }
    }
  };

  const handleCancel = () => {
    if (record) {
      const recordValues = Object.entries(record).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value
      }), {} as Partial<InferSchemaType<S>>);
      setValues(recordValues);
      setHasChanges(false);
      setEditMode(false);
    }
  };

  const isEditable = record ? canEdit(record) : false;

  return (
    <Card className="h-[calc(100vh-12rem)] overflow-auto">
      <CardHeader className="flex flex-row items-center justify-end sticky top-0 bg-background z-10">
        <div className="flex gap-2">
          {isEditable && (
            <>
              <Button
                onClick={() => editMode ? handleCancel() : setEditMode(true)}
                size="sm"
                variant="outline"
              >
                {editMode ? "取消編輯" : "編輯"}
              </Button>
              {editMode && (
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  variant={hasChanges ? "default" : "secondary"}
                  disabled={!hasChanges || !isValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  更新
                </Button>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {columns.filter(c => c.viewOnly !== true).map(column => {
            if (column.type === 'password' && !isEditable) {
              return null;
            }

            const isMultiline = column.multiline;

            return (
              <div
                key={String(column.key)}
                className={cn(
                  "space-y-2 w-full",
                  isMultiline ? "col-span-2" : ""
                )}
              >
                <label className="font-medium text-sm text-muted-foreground block">
                  {column.label}
                </label>
                <div className={cn(
                  "w-full",
                  isMultiline ? "min-h-[100px]" : "h-10"
                )}>
                  {renderField({
                    column,
                    value: values[column.key as keyof typeof values],
                    onChange: (value) => handleChange(column.key as keyof T & keyof InferSchemaType<S>, value),
                    error: errors[column.key as keyof typeof errors],
                    isEditing: editMode && isEditable,
                    isNewRecord: false
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}