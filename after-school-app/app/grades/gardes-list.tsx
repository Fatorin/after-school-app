'use client'

import { useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { StudentGrade, createStudentGradeColumns, studentGradeSchema, StudentGradeSchemaShape, StudentGradeUpsertReq } from '@/types/grades';
import { Student, StudentUpsertReq } from '@/types/student';
import { API_PATH } from '../apis/common';
import { useCrud } from '@/hooks/use-crud';

export function StudentGradeList() {
  const { me } = useAuth();

  const {
    items: students,
    fetchItems: fetchStudents,
    initialized: fetchStudentsInitialized,
  } = useCrud<Student, StudentUpsertReq>({
    basePath: API_PATH.students,
    dateFields: {
      date_of_birth: true
    }
  });

  const {
    items,
    initialized,
    isLoading,
    fetchItems,
    handleInsert,
    handleUpdate,
    handleDelete
  } = useCrud<StudentGrade, StudentGradeUpsertReq>({
    basePath: API_PATH.studentGrades,
    dateFields: {
      updated_at: true
    }
  });

  const studentGradeColumns = createStudentGradeColumns(students);

  useEffect(() => {
    if (!initialized && !fetchStudentsInitialized) {
      fetchStudents().catch(console.error);
      fetchItems().catch(console.error);
    }
  }, [fetchItems, fetchStudents, initialized, fetchStudentsInitialized]);

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
    <GenericDataTable<StudentGrade, StudentGradeSchemaShape>
      data={items}
      columns={studentGradeColumns}
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
      schema={studentGradeSchema}
    />
  );
}