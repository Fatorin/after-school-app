'use client'

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { GenericDataTable } from '@/components/generic_table/generic-data-table';
import { useApiRequest } from '@/hooks/use-api-request';
import { StudentGrade, StudentGradeUpsertReq, createStudentGradeColumns, studentGradeSchema, StudentGradeSchemaShape } from '@/types/grades';
import { Student } from '@/types/student';
import { transformDates } from '@/lib/utils';

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
      const result = await handleApiRequest(API_PATH.students, { method: 'GET' });
      const transformedData = result.data.map((item: Student) => 
        transformDates(item, ['joined_at'])
      );
      setStudents(transformedData);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest]);

  const fetchStudentGrades = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await handleApiRequest(API_PATH.studentGrades, { method: 'GET' });
      const transformedData = result.data.map((item: StudentGrade) => 
        transformDates(item, ['updated_at'])
      );
      setStudentGrades(transformedData);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest]);

  useEffect(() => {
    fetchStudents();
    fetchStudentGrades();
  }, [fetchStudents, fetchStudentGrades]);

  const handleInsert = useCallback(async (StudentGrade: StudentGrade) => {
    const upsertReq = createStudentGradeUpsertReq(StudentGrade);
    const data = JSON.stringify(upsertReq);
    console.log(data);
    await handleApiRequest(
      API_PATH.studentGrades,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      {
        title: "新增成功",
        description: "學生資料已新增",
      }
    );
    await fetchStudentGrades();
  }, [handleApiRequest, fetchStudentGrades]);

  const handleUpdate = useCallback(async (StudentGrade: StudentGrade) => {
    const upsertReq = createStudentGradeUpsertReq(StudentGrade);
    const updateStudentGrade = await handleApiRequest(
      `${API_PATH.studentGrades}/${StudentGrade.id}`,
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
    return updateStudentGrade.data;
  }, [handleApiRequest, fetchStudentGrades]);

  const handleDelete = useCallback(async (studentGrade: StudentGrade) => {
    await handleApiRequest(
      `${API_PATH.studentGrades}/${studentGrade.id}`,
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