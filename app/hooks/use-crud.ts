import { useState, useCallback } from 'react';
import { AuthenticationError, useApiRequest } from '@/hooks/use-api-request';
import { DateFieldsMap } from '@/types/common';

interface CrudOptions<T extends object, S extends Partial<T>> {
  basePath: string;
  dateFields?: T extends object ? DateFieldsMap<T> : never;
  transformBeforeUpsert?: (data: T) => S;
  successMessages?: {
    create?: { title: string; description: string };
    update?: { title: string; description: string };
    delete?: { title: string; description: string };
  };
}

export function useCrud<T extends { id: string }, S extends Partial<T> = Partial<T>>(
  options: CrudOptions<T, S>
) {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<T[]>([]);
  const handleApiRequest = useApiRequest();
  const {
    basePath,
    dateFields,
    transformBeforeUpsert = ((data: T): S => ({ ...data } as unknown as S)),
    successMessages = {
      create: { title: "新增成功", description: "資料已新增" },
      update: { title: "更新成功", description: "資料已更新" },
      delete: { title: "刪除成功", description: "資料已刪除" }
    }
  } = options;

  const withApiOperation = useCallback(
    async <R>(operation: () => Promise<R>): Promise<R> => {
      setIsLoading(true);
      try {
        const result = await operation();
        setIsLoading(false);
        return result;
      } catch (error) {
        setIsLoading(false);
        if (error instanceof AuthenticationError) {
          console.log("Authentication error caught in useCrud, redirecting...");
          throw error;
        }
        console.error("CRUD Error:", error);
        throw error;
      }
    },
    []
  );

  const fetchItems = useCallback(async () => {
    if (!initialized) {
      setInitialized(true);
    }
    return withApiOperation(async () => {
      const { data } = await handleApiRequest<T[]>({
        url: basePath,
        options: { method: 'GET' },
        dateFields: dateFields
      });
      if (data) setItems(data);
      return data;
    });
  }, [initialized, handleApiRequest, basePath, dateFields, withApiOperation]);

  const handleInsert = useCallback(
    async (item: T) => {
      return withApiOperation(async () => {
        const upsertReq = transformBeforeUpsert(item);
        await handleApiRequest({
          url: basePath,
          options: { method: 'POST', body: JSON.stringify(upsertReq) },
          successMessage: successMessages.create
        });
        await fetchItems();
      });
    },
    [transformBeforeUpsert, handleApiRequest, basePath, successMessages.create, fetchItems, withApiOperation]
  );

  const handleUpdate = useCallback(
    async (item: T) => {
      return withApiOperation(async () => {
        const upsertReq = transformBeforeUpsert(item);
        const result = await handleApiRequest<T>({
          url: `${basePath}/${item.id}`,
          options: { method: 'PUT', body: JSON.stringify(upsertReq) },
          dateFields: dateFields,
          successMessage: successMessages.update
        });
        await fetchItems();
        if (!result.data) throw new Error('更新失敗：沒有回傳資料');
        return result.data;
      });
    },
    [transformBeforeUpsert, handleApiRequest, basePath, dateFields, successMessages.update, fetchItems, withApiOperation]
  );

  const handleDelete = useCallback(
    async (item: T) => {
      return withApiOperation(async () => {
        await handleApiRequest({
          url: `${basePath}/${item.id}`,
          options: { method: 'DELETE' },
          successMessage: successMessages.delete
        });
        await fetchItems();
      });
    },
    [handleApiRequest, basePath, successMessages.delete, fetchItems, withApiOperation]
  );

  return {
    items,
    initialized,
    isLoading,
    fetchItems,
    handleInsert,
    handleUpdate,
    handleDelete
  };
}