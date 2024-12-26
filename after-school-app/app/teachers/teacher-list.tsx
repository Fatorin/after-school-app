'use client'

import { useState, useCallback, useEffect } from 'react';
import { Teacher, TeacherUpsertReq, teacherColumns, teacherSchema, TeacherSchemaShape } from '@/types/teacher';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { useApiRequest } from '@/hooks/use-api-request';

const API_PATH = {
  teachers: `${process.env.NEXT_PUBLIC_API_URL}/api/teachers`,
};

const createTeacherUpsertReq = (teacher: Teacher): TeacherUpsertReq => {
  const { ...upsertReq } = teacher;
  return upsertReq;
};

export function TeacherList() {
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const { me } = useAuth();
  const handleApiRequest = useApiRequest();

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await handleApiRequest(API_PATH.teachers, { method: 'GET' });
      setTeachers(result.data);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleInsert = useCallback(async (teacher: Teacher) => {
    const upsertReq = createTeacherUpsertReq(teacher);
    await handleApiRequest(
      API_PATH.teachers,
      {
        method: 'POST',
        body: JSON.stringify(upsertReq),
      },
      {
        title: "新增成功",
        description: "教職員資料已新增",
      }
    );
    await fetchTeachers();
  }, [handleApiRequest, fetchTeachers]);

  const handleUpdate = useCallback(async (teacher: Teacher) => {
    const upsertReq = createTeacherUpsertReq(teacher);
    const updatedTeacher = await handleApiRequest(
      `${API_PATH.teachers}/${teacher.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(upsertReq),
      },
      {
        title: "更新成功",
        description: "教職員資料已更新",
      }
    );
    await fetchTeachers();
    return updatedTeacher.data;
  }, [handleApiRequest, fetchTeachers]);

  const handleDelete = useCallback(async (teacher: Teacher) => {
    console.log(teacher);
    await handleApiRequest(
      `${API_PATH.teachers}/${teacher.id}`,
      {
        method: 'DELETE'
      },
      {
        title: "刪除成功",
        description: "教職員資料已刪除",
      }
    );
    await fetchTeachers();
  }, [handleApiRequest, fetchTeachers]);

  const permissionConfig = {
    canEdit: useCallback((teacher: Teacher) => {
      if (!me) return false;
      if (me.role === 'super_admin') return true;
      return me.role === 'admin' && me.id === teacher.id;
    }, [me]),
    canDelete: useCallback((teacher: Teacher) => {
      if (!me) return false;
      return (
        (me.role === 'admin' && me.id === teacher.id) ||
        (me.role === 'super_admin' && me.id !== teacher.id)
      );
    }, [me])
  };

  return (
    <GenericDataTable<Teacher, TeacherSchemaShape>
      data={teachers}
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