import { useState } from 'react';

export function useDeleteDialog<T>(onDelete: (record: T) => Promise<void>) {
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    record: T | null;
  }>({
    isOpen: false,
    record: null,
  });

  const handleOpenDeleteDialog = (record: T) => {
    setDeleteDialogState({ isOpen: true, record });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogState({ isOpen: false, record: null });
  };

  const handleConfirmDelete = async (record: T) => {
    try {
      await onDelete(record);
      setDeleteDialogState({ isOpen: false, record: null });
    } catch (error) {
      throw error;
    }
  };

  return {
    deleteDialogState,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}