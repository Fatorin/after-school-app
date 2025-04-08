'use client'

import { useEffect } from 'react';
import { Teacher, teacherColumns, teacherSchema, TeacherSchemaShape, TeacherUpsertReq } from '@/types/teacher';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { useCrud } from '@/hooks/use-crud';
import { createFormStore } from '@/stores/form-store';
import { Me } from '@/types/me';
import { API_PATH } from '@/lib/api/common';

export function TeacherList({ me }: { me: Me | null }) {
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

  const teacherFormStore = createFormStore(teacherSchema);

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
      permissionConfig={permissionConfig}
      userRole={me?.role || 'user'}
      onInsert={handleInsert}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      isLoading={isLoading}
      formStore={teacherFormStore}
    />
  );
}