import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, GetConvertedValue } from "@/lib/utils";
import { BaseRecord, ColumnConfig } from '@/types/generic_table';
import { renderField } from "./helper";
import { z } from "zod";
import { FormStore } from "@/stores/form-store";

type InferSchemaType<S extends z.ZodRawShape> = z.infer<z.ZodObject<S>>;

interface EditDialogProps<T extends BaseRecord, S extends z.ZodRawShape> {
  record: T | null;
  columns: ColumnConfig<T>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (record: T) => Promise<void>;
  useFormStore: () => FormStore<S>;
}

export function EditDialog<T extends BaseRecord, S extends z.ZodRawShape>({
  record,
  columns,
  open,
  onOpenChange,
  onSubmit,
  useFormStore
}: EditDialogProps<T, S>) {
  const {
    values,
    errors,
    isValid,
    setValues,
    setMode,
    validateField,
    validateForm,
    resetForm,
  } = useFormStore();

  const isNewRecord = !record;

  useEffect(() => {
    if (open) {
      setMode(isNewRecord ? 'create' : 'update');
      if (record) {
        const recordValues = Object.entries(record).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value
        }), {} as Partial<InferSchemaType<S>>);
        setValues(recordValues);
      } else {
        resetForm();
      }
    }
  }, [open, record, isNewRecord, setMode, setValues, resetForm]);

  const handleChange = (field: keyof T & keyof InferSchemaType<S>, value: unknown) => {  
    const column = columns.find(c => c.key === field);  
    const convertedValue =  GetConvertedValue(column?.type, value);
    setValues({ [field]: convertedValue } as Partial<InferSchemaType<S>>);
    validateField(field);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const submitData = Object.entries(values).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value
        }), {} as T);

        await onSubmit(submitData);
        resetForm();
        onOpenChange(false);
      } catch (error) {
        console.error('提交失敗:', error);
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[960px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isNewRecord ? `新增` : `編輯`}
          </DialogTitle>
          <DialogDescription>
            {isNewRecord ? '請填寫以下欄位內容' : '請修改以下欄位內容'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {columns.filter(c => c.viewOnly !== true).map(column => (
              <div
                key={String(column.key)}
                className={cn(
                  "space-y-2",
                  column.multiline ? "col-span-1 md:col-span-3" : ""
                )}
              >
                <label className="text-sm font-medium text-muted-foreground">
                  {column.label}
                </label>
                {renderField({
                  column,
                  value: values[column.key as keyof typeof values],
                  onChange: (value) => handleChange(column.key as keyof T & keyof InferSchemaType<S>, value),
                  error: errors[column.key as keyof typeof errors],
                  isEditing: true,
                  isNewRecord
                })}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {isNewRecord ? '新增' : '確認'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}