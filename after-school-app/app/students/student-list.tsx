'use client'

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { Student, StudentUpsertReq, studentColumns, studentSchema, StudentSchemaShape } from '@/types/student';
import { useApiRequest } from '@/hooks/use-api-request';

const API_PATH = {
  students: `${process.env.NEXT_PUBLIC_API_URL}/api/students`,
};

const createStudentUpsertReq = (student: Student): StudentUpsertReq => {
  const { ...upsertReq } = student;
  return upsertReq;
};

export function StudentList() {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const { me } = useAuth();
  const handleApiRequest = useApiRequest();

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await handleApiRequest<Student[]>(API_PATH.students, { method: 'GET' });
      if (data) setStudents(data);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleInsert = useCallback(async (student: Student) => {
    const upsertReq = createStudentUpsertReq(student);
    await handleApiRequest(
      API_PATH.students,
      {
        method: 'POST',
        body: JSON.stringify(upsertReq),
      },
      {
        title: "新增成功",
        description: "學生資料已新增",
      }
    );
    await fetchStudents();
  }, [handleApiRequest, fetchStudents]);

  const handleUpdate = useCallback(async (student: Student) => {
    const upsertReq = createStudentUpsertReq(student);
    const { data } = await handleApiRequest(
      `${API_PATH.students}/${student.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(upsertReq),
      },
      {
        title: "更新成功",
        description: "學生資料已更新",
      }
    );
    await fetchStudents();
    if (!data) throw new Error('更新失敗：沒有回傳資料');
    return data;
  }, [handleApiRequest, fetchStudents]);

  const handleDelete = useCallback(async (student: Student) => {
    await handleApiRequest(
      `${API_PATH.students}/${student.id}`,
      {
        method: 'DELETE'
      },
      {
        title: "刪除成功",
        description: "學生資料已刪除",
      }
    );
    await fetchStudents();
  }, [handleApiRequest, fetchStudents]);

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
      data={students}
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