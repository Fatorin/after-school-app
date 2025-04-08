'use client'

import { useCallback, useEffect } from 'react';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { Student, studentColumns, studentSchema, StudentSchemaShape, StudentUpsertReq } from '@/types/student';
import { useCrud } from '@/hooks/use-crud';
import { createFormStore } from '@/stores/form-store';
import { Me } from '@/types/me';
import { API_PATH } from '@/lib/api/common';

export function StudentList({ me }: { me: Me | null }) {

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

  const studentFormStore = createFormStore(studentSchema);

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
      permissionConfig={permissionConfig}
      userRole={me?.role || 'user'}
      onInsert={handleInsert}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      isLoading={isLoading}
      formStore={studentFormStore} />
  );
}