import { BaseRecord } from '@/types/generic-table';
import { useState } from 'react';
import { toast } from "sonner";

export function useEditDialog<T extends BaseRecord>(
  onUpdate: (record: T) => Promise<T>,
  onInsert: (record: T) => Promise<void>
) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    record: T | null;
  }>({
    isOpen: false,
    record: null,
  });

  const handleSubmit = async (record: T) => {
    try {
      await (dialogState.record?.id ? onUpdate(record) : onInsert(record));
      setDialogState({ isOpen: false, record: null });
    } catch (error) {
      toast.error("操作失敗", {
        description: "操作失敗，請稍後再試。",
      });
      throw error;
    }
  };

  const handleOpenDialog = (record: T | null = null) => {
    setDialogState({ isOpen: true, record });
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, record: null });
  };

  return {
    dialogState,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
  };
}