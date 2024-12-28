import { useApiRequest } from '@/hooks/use-api-request';
import { Student, studentDateFields, StudentUpsertReq } from '@/types/student';
import { API_PATH } from './common';

export const useStudentApi = () => {
  const handleApiRequest = useApiRequest();

  const fetchStudents = async () => {
    const { data } = await handleApiRequest<Student[]>({
      url: API_PATH.students,
      options: { method: 'GET' },
      dateFields: studentDateFields
    });
    return data;
  };

  const createStudent = async (Student: Student) => {
    const upsertReq: StudentUpsertReq = { ...Student };
    await handleApiRequest({
      url: API_PATH.students,
      options: { method: 'POST', body: JSON.stringify(upsertReq) },
      successMessage: {
        title: "新增成功",
        description: "學員資料已新增",
      }
    });
  };

  const updateStudent = async (Student: Student) => {
    const upsertReq: StudentUpsertReq = { ...Student };
    return await handleApiRequest<Student>({
      url: `${API_PATH.students}/${Student.id}`,
      options: { method: 'PUT', body: JSON.stringify(upsertReq) },
      dateFields: studentDateFields,
      successMessage: {
        title: "更新成功",
        description: "學員資料已更新",
      }
    });
  };

  const deleteStudent = async (Student: Student) => {
    await handleApiRequest({
      url: `${API_PATH.students}/${Student.id}`,
      options: { method: 'DELETE' },
      successMessage: {
        title: "刪除成功",
        description: "學員資料已刪除",
      }
    });
  };

  return {
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
