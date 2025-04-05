'use client'

import { useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { Student, studentColumns, studentSchema, StudentSchemaShape, StudentUpsertReq } from '@/types/student';
import { API_PATH } from '../apis/common';
import { useCrud } from '@/hooks/use-crud';

export function StudentList() {
  const { me } = useAuth();
  const {
    items,
    initialized,
    isLoading,
    fetchItems,
    handleInsert,
    handleUpdate,
    handleDelete
  } = useCrud<Student, StudentUpsertReq>({
    basePath: API_PATH.students,
    dateFields: {
      date_of_birth: true
    }
  });

  useEffect(() => {
    if (!initialized) {
      fetchItems().catch(console.error);
    }
  }, [fetchItems, initialized]);

  const permissionConfig = {
    canEdit: useCallback(() => {
      if (!me) return false;
      return me.role === 'super_admin' || me.role === 'admin';
    }, [me]),
    canDelete: useCallback(() => {
      if (!me) return false;
      return me.role === 'super_admin' || me.role === 'admin';
    }, [me])
  };

  return (
    <GenericDataTable<Student, StudentSchemaShape>
      data={items}
      columns={studentColumns}
      viewConfig={{
        enablePreviewMode: true,
        defaultViewMode: 'list'
      }}
      permissionConfig={permissionConfig}
      userRole={me?.role || 'user'}
      onInsert={handleInsert}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      isLoading={isLoading}
      schema={studentSchema}
    />
  );
}