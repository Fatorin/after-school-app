import React, { useMemo, useCallback, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from './data-table';
import { EditDialog } from './edit-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { BaseRecord, DataTableProps } from '@/types/generic-table';
import { useEditDialog } from './hooks/useEditDialog';
import { useDeleteDialog } from './hooks/useDeleteDialog';

export function GenericDataTable<T extends BaseRecord, S extends z.ZodRawShape>({
  data,
  columns,
  permissionConfig,
  userRole,
  onInsert,
  onUpdate,
  onDelete,
  isLoading,
  formStore,
}: DataTableProps<T, S>) {

  const {
    dialogState,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
  } = useEditDialog<T>(onUpdate, onInsert);

  const {
    deleteDialogState,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useDeleteDialog<T>(onDelete);

  const [selectedRecord, setSelectedRecord] = React.useState<T | null>(null);
  const updatedSelectedRecord = useMemo(() => {
    return selectedRecord ? data.find(item => item.id === selectedRecord.id) || null : null;
  }, [data, selectedRecord]);

  useEffect(() => {
    setSelectedRecord(updatedSelectedRecord);
  }, [updatedSelectedRecord]);

  const formatCellValue = useCallback((value: unknown, column: typeof columns[0]) => {
    if (column.type === 'enum' && column.options) {
      return column.options.find(opt => opt.value === value)?.label || '';
    }
    if (column.type === 'boolean') {
      return (value as boolean) ? '是' : '否';
    }
    if (column.type === 'date' && value) {
      return format(new Date(value as string), 'yyyy-MM-dd');
    }
    return value ? String(value) : '';
  }, []);

  const tableColumns = useMemo(() => {
    const dataColumns: ColumnDef<T>[] = columns
      .filter(column => !column.hidden)
      .map(column => ({
        accessorKey: String(column.key),
        header: column.label,
        cell: ({ row }) => formatCellValue(row.getValue(String(column.key)), column),
      }));

    if (!permissionConfig.canEdit) return dataColumns;

    return [
      ...dataColumns,
      {
        id: 'actions',
        cell: ({ row }) => {
          const canEdit = permissionConfig.canEdit(row.original, userRole);
          const canDelete = permissionConfig.canDelete(row.original, userRole);

          if (!canEdit) return null;

          return (
            <div className="flex justify-end gap-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(row.original)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDeleteDialog(row.original)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                </Button>
              )}
            </div>
          );
        },
      },
    ];
  }, [columns, permissionConfig, formatCellValue, userRole, handleOpenDialog, handleOpenDeleteDialog]);

  if (!columns.length) return null;

  return (
    <div className="space-y-4">
      <DataTable
        columns={tableColumns}
        data={data}
        isLoading={isLoading}
        onAddNew={() => handleOpenDialog(null)}
      />

      <EditDialog<T, S>
        record={dialogState.record}
        columns={columns}
        open={dialogState.isOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleSubmit}
        useFormStore={formStore}
      />

      <AlertDialog
        open={deleteDialogState.isOpen}
        onOpenChange={handleCloseDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除此筆資料嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialogState.record) {
                  handleConfirmDelete(deleteDialogState.record);
                }
              }}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}