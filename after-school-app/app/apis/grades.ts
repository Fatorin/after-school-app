import { useApiRequest } from '@/hooks/use-api-request';
import { StudentGrade, studentGradeDateFields, StudentGradeUpsertReq } from '@/types/grades';
import { API_PATH } from './common';

export const useStudentGradeApi = () => {
  const handleApiRequest = useApiRequest();
  
  const fetchStudentGrades = async () => {
    const { data } = await handleApiRequest<StudentGrade[]>({
      url: API_PATH.studentGrades,
      options: { method: 'GET' },
      dateFields: studentGradeDateFields
    });
    return data;
  };

  const createStudentGrade = async (StudentGrade: StudentGrade) => {
    const upsertReq: StudentGradeUpsertReq = { ...StudentGrade };
    await handleApiRequest({
      url: API_PATH.studentGrades,
      options: { method: 'POST', body: JSON.stringify(upsertReq) },
      successMessage: {
        title: "新增成功",
        description: "學員成績已新增",
      }
    });
  };

  const updateStudentGrade = async (StudentGrade: StudentGrade) => {
    const upsertReq: StudentGradeUpsertReq = { ...StudentGrade };
    return await handleApiRequest<StudentGrade>({
      url: `${API_PATH.studentGrades}/${StudentGrade.id}`,
      options: { method: 'PUT', body: JSON.stringify(upsertReq) },
      dateFields: studentGradeDateFields,
      successMessage: {
        title: "更新成功",
        description: "學員成績已更新",
      }
    });
  };

  const deleteStudentGrade = async (StudentGrade: StudentGrade) => {
    await handleApiRequest({
      url: `${API_PATH.studentGrades}/${StudentGrade.id}`,
      options: { method: 'DELETE' },
      successMessage: {
        title: "刪除成功",
        description: "學員成績已刪除",
      }
    });
  };

  return {
    fetchStudentGrades,
    createStudentGrade,
    updateStudentGrade,
    deleteStudentGrade,
  };
};
