import { create } from 'zustand';
import { z } from 'zod';

export type ValidationMode = 'create' | 'update';

export interface FormStoreConfig<T extends z.ZodRawShape> {
  schemas: {
    create: z.ZodObject<T>;
    update: z.ZodObject<T>;
  };
  defaultValues: {
    create: Partial<z.infer<z.ZodObject<T>>>;
    update: Partial<z.infer<z.ZodObject<T>>>;
  };
}

export interface FormStore<T extends z.ZodRawShape> {
  values: Partial<z.infer<z.ZodObject<T>>>;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  mode: ValidationMode;
  setValues: (values: Partial<z.infer<z.ZodObject<T>>>) => void;
  setMode: (mode: ValidationMode) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}

export function createFormStore<T extends z.ZodRawShape>(
  config: FormStoreConfig<T>
) {
  const { schemas, defaultValues } = config;

  return create<FormStore<T>>((set, get) => ({
    values: defaultValues.create,
    errors: {},
    isValid: false,
    mode: 'create' as ValidationMode,

    setMode: (mode) => {
      set({
        mode,
        values: defaultValues[mode]
      });
      get().validateForm();
    },

    setValues: (newValues) => {
      set((state) => ({
        values: { ...state.values, ...newValues },
      }));
      get().validateForm();
    },

    validateField: (field) => {
      const { values, errors, mode } = get();
      const currentSchema = mode === 'create' ? schemas.create : schemas.update;
      const value = values[field];

      try {
        const fieldValue = { [field]: value };
        currentSchema.partial().parse(fieldValue);

        set({
          errors: {
            ...errors,
            [field]: undefined
          }
        });
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors[0]?.message || '驗證錯誤';
          set({
            errors: {
              ...errors,
              [field]: fieldError
            }
          });
        }
        return false;
      }
    },

    validateForm: () => {
      const { values, mode } = get();
      const currentSchema = mode === 'create' ? schemas.create : schemas.update;

      try {
        const schemaToUse = mode === 'update' ? currentSchema.partial() : currentSchema;
        schemaToUse.parse(values);
        set({ errors: {}, isValid: true });
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Partial<Record<keyof T, string>> = {};
          error.errors.forEach((err) => {
            const path = err.path[0];
            if (path) {
              newErrors[path as keyof T] = err.message;
            }
          });
          set({ errors: newErrors, isValid: false });
        }
        return false;
      }
    },

    resetForm: () => {
      const { mode } = get();
      set({
        values: defaultValues[mode],
        errors: {},
        isValid: false,
        mode: 'create'
      });
    },
  }));
}