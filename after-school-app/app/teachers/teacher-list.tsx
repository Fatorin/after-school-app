'use client'

import { useEffect } from 'react';
import { Teacher, teacherColumns, teacherSchema, TeacherSchemaShape, TeacherUpsertReq } from '@/types/teacher';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { useCrud } from '@/hooks/use-crud';
import { API_PATH } from '../apis/common';

export function TeacherList() {
  const { me } = useAuth();
  const {
    items,
    initialized,
    isLoading,
    fetchItems,
    handleInsert,
    handleUpdate,
    handleDelete
  } = useCrud<Teacher, TeacherUpsertReq>({
    basePath: API_PATH.teachers,
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
    canEdit: (teacher: Teacher) => {
      if (!me) return false;
      if (me.role === 'super_admin') return true;
      return me.role === 'admin' && me.id === teacher.id;
    },
    canDelete: (teacher: Teacher) => {
      if (!me) return false;
      return (
        (me.role === 'admin' && me.id === teacher.id) ||
        (me.role === 'super_admin' && me.id !== teacher.id)
      );
    }
  };

  return (
    <GenericDataTable<Teacher, TeacherSchemaShape>
      data={items}
      columns={teacherColumns}
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
      schema={teacherSchema}
    />
  );
}