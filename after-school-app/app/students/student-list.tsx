'use client'

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { Student, StudentUpsertReq } from '@/types/student';
import { studentColumns, studentSchema, StudentSchemaShape } from './schema';
import { BASE_API_CONFIG } from '@/lib/utils';

const API_PATH = {
  students: `${process.env.NEXT_PUBLIC_API_URL}/api/students`,
};

const createStudentUpsertReq = (student: Student): StudentUpsertReq => {
  const { ...upsertReq } = student;
  return upsertReq;
};

export function StudentList() {
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setStudents] = useState<Student[]>([]);
  const { toast } = useToast();
  const { me } = useAuth();

  const useApiRequest = () => {
    return useCallback(async (
      url: string,
      options: RequestInit,
      successMessage?: { title: string; description: string }
    ) => {
      try {
        const response = await fetch(url, {
          ...BASE_API_CONFIG,
          ...options,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '操作失敗');
        }

        if (successMessage) {
          toast(successMessage);
        }

        return await response.json();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "錯誤",
          description: error instanceof Error ? error.message : "操作失敗",
        });
        throw error;
      }
    }, []);
  };

  const handleApiRequest = useApiRequest();

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await handleApiRequest(API_PATH.students, { method: 'GET' });
      setStudents(result.data);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleInsert = useCallback(async (student: Student) => {
    const upsertReq = createStudentUpsertReq(student);
    const data = JSON.stringify(upsertReq);
    console.log(data);
    await handleApiRequest(
      API_PATH.students,
      {
        method: 'POST',
        body: JSON.stringify(data),
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
    const updateStudent = await handleApiRequest(
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
    return updateStudent.data;
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
      data={teachers}
      columns={studentColumns}
      viewConfig={{
        enablePreviewMode: true,
        defaultViewMode: 'list'
      }}
      permissionConfig={permissionConfig}
      userRole={me?.role || 'non_user'}
      onInsert={handleInsert}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      isLoading={isLoading}
      schema={studentSchema}
    />
  );
}