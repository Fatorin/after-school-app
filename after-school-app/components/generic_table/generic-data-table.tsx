import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { LayoutGrid, List, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseRecord, DataTableProps } from '@/types/generic_table';
import { DataTable } from './data-table';
import { EditDialog } from './edit-dialog';
import { SearchList } from './search-list';
import { PreviewCard } from './preview-card';
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
import { createFormStore } from '@/stores/form-store';
import { format } from 'date-fns';

export function GenericDataTable<T extends BaseRecord, S extends z.ZodRawShape>({
  data,
  columns,
  viewConfig = {},
  permissionConfig,
  userRole,
  onInsert,
  onUpdate,
  onDelete,
  isLoading,
  schema
}: DataTableProps<T, S>) {
  const previewFormStore = createFormStore(schema);
  const editFormStore = createFormStore(schema);

  const { enablePreviewMode = true, defaultViewMode = 'list' } = viewConfig;
  const [viewMode, setViewMode] = useState<'list' | 'preview'>(defaultViewMode);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    record: T | null;
  }>({
    isOpen: false,
    record: null
  });
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    record: T | null;
  }>({
    isOpen: false,
    record: null
  });

  useEffect(() => {
    if (selectedRecord) {
      const updatedSelectedRecord = data.find(item => item.id === selectedRecord.id);
      if (updatedSelectedRecord) {
        setSelectedRecord(updatedSelectedRecord);
      }
    }
  }, [data, selectedRecord]);

  const handleSubmit = useCallback(async (record: T) => {
    try {
      await (dialogState.record?.id ? onUpdate(record) : onInsert(record));
      setDialogState(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Operation failed:', error);
    }
  }, [dialogState.record?.id, onUpdate, onInsert]);

  const handleOpenDialog = useCallback((record: T | null = null) => {
    setDialogState({
      isOpen: true,
      record
    });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogState({
      isOpen: false,
      record: null
    });
  }, []);

  const handleDelete = useCallback(async (record: T) => {
    try {
      await onDelete(record);
      setDeleteDialogState({ isOpen: false, record: null });
      if (viewMode === 'preview' && selectedRecord?.id === record.id) {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error('Delete operation failed:', error);
    }
  }, [onDelete, viewMode, selectedRecord]);

  const renderCellValue = useCallback((value: unknown, column: typeof columns[0]) => {
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
      .filter(column => column.type !== 'password')
      .map(column => ({
        accessorKey: String(column.key),
        header: column.label,
        cell: ({ row }) => renderCellValue(row.getValue(String(column.key)), column)
      }));

    if (!permissionConfig.canEdit) return dataColumns;

    return [
      ...dataColumns,
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => {
          const canEdit = permissionConfig.canEdit(row.original, userRole);
          const canDelete = permissionConfig.canDelete(row.original, userRole);

          if (!canEdit) return null;

          return (
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(row.original)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  編輯
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDialogState({
                    isOpen: true,
                    record: row.original
                  })}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  刪除
                </Button>
              )}
            </div>
          );
        }
      }
    ];
  }, [columns, permissionConfig, renderCellValue, userRole, handleOpenDialog]);

  if (!columns.length) return null;

  const displayField = columns[0].key;
  const subDisplayField = columns.length > 1 ? columns[columns.length - 1].key : displayField;

  const renderViewModeButton = (mode: 'list' | 'preview', Icon: typeof List | typeof LayoutGrid, label: string) => (
    <Button
      variant={viewMode === mode ? 'default' : 'outline'}
      size="sm"
      onClick={() => setViewMode(mode)}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );

  const renderContent = () => {
    if (viewMode === 'list') {
      return (
        <DataTable
          columns={tableColumns}
          data={data}
          isLoading={isLoading}
        />
      );
    }

    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <SearchList
            data={data}
            selectedId={selectedRecord?.id || null}
            onSelect={setSelectedRecord}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            displayField={displayField}
            subDisplayField={subDisplayField}
            columns={columns}
          />
        </div>
        <div className="col-span-8">
          <PreviewCard<T, S>
            record={selectedRecord}
            columns={columns}
            canEdit={(record) => permissionConfig.canEdit(record, userRole)}
            canDelete={(record) => permissionConfig.canDelete(record, userRole)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            useFormStore={previewFormStore} />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {enablePreviewMode && (
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {renderViewModeButton('list', List, '列表')}
              {renderViewModeButton('preview', LayoutGrid, '卡片')}
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleOpenDialog(null)}
            >
              新增
            </Button>
          </div>
        )}

        {renderContent()}

        <EditDialog<T, S>
          record={dialogState.record}
          columns={columns}
          open={dialogState.isOpen}
          onOpenChange={handleCloseDialog}
          onSubmit={handleSubmit}
          useFormStore={editFormStore} />

        <AlertDialog
          open={deleteDialogState.isOpen}
          onOpenChange={(isOpen) =>
            setDeleteDialogState(prev => ({ ...prev, isOpen }))
          }
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
                onClick={() =>
                  deleteDialogState.record &&
                  handleDelete(deleteDialogState.record)
                }
              >
                確認刪除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}