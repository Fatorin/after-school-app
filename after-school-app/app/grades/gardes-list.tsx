'use client'

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { useApiRequest } from '@/hooks/use-api-request';
import { StudentGrade, StudentGradeUpsertReq, createStudentGradeColumns, studentGradeSchema, StudentGradeSchemaShape } from '@/types/grades';
import { Student } from '@/types/student';

const API_PATH = {
  students: `${process.env.NEXT_PUBLIC_API_URL}/api/students`,
  studentGrades: `${process.env.NEXT_PUBLIC_API_URL}/api/grades`,
};

const createStudentGradeUpsertReq = (StudentGrade: StudentGrade): StudentGradeUpsertReq => {
  const { ...upsertReq } = StudentGrade;
  return upsertReq;
};

export function StudentGradeList() {
  const [isLoading, setIsLoading] = useState(true);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const { me } = useAuth();
  const handleApiRequest = useApiRequest();
  const studentGradeColumns = createStudentGradeColumns(students);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await handleApiRequest<Student[]>(API_PATH.students, { method: 'GET' });
      if (data) setStudents(data);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest]);

  const fetchStudentGrades = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await handleApiRequest<StudentGrade[]>(API_PATH.studentGrades, { method: 'GET' });
      if (data) setStudentGrades(data);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest]);

  useEffect(() => {
    fetchStudents();
    fetchStudentGrades();
  }, [fetchStudents, fetchStudentGrades]);

  const handleInsert = useCallback(async (grade: StudentGrade) => {
    const upsertReq = createStudentGradeUpsertReq(grade);    
    await handleApiRequest(
      API_PATH.studentGrades,
      {
        method: 'POST',
        body: JSON.stringify(upsertReq),
      },
      {
        title: "新增成功",
        description: "學生資料已新增",
      }
    );
    await fetchStudentGrades();
  }, [handleApiRequest, fetchStudentGrades]);

  const handleUpdate = useCallback(async (grade: StudentGrade) => {
    const upsertReq = createStudentGradeUpsertReq(grade);
    const { data } = await handleApiRequest<StudentGrade>(
      `${API_PATH.studentGrades}/${grade.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(upsertReq),
      },
      {
        title: "更新成功",
        description: "學生資料已更新",
      }
    );
    await fetchStudentGrades();
    if (!data) throw new Error('更新失敗：沒有回傳資料');
    return data;
  }, [handleApiRequest, fetchStudentGrades]);

  const handleDelete = useCallback(async (grade: StudentGrade) => {
    await handleApiRequest(
      `${API_PATH.studentGrades}/${grade.id}`,
      {
        method: 'DELETE'
      },
      {
        title: "刪除成功",
        description: "學生成績已刪除",
      }
    );
    await fetchStudentGrades();
  }, [handleApiRequest, fetchStudentGrades]);

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
      data={studentGrades}
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