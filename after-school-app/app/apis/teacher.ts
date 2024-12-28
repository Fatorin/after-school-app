import { Teacher, teacherDateFields, TeacherUpsertReq } from '@/types/teacher';
import { useApiRequest } from '@/hooks/use-api-request';

const API_PATH = {
  teachers: `${process.env.NEXT_PUBLIC_API_URL}/api/teachers`,
};

export const useTeacherApi = () => {
  const handleApiRequest = useApiRequest();

  const fetchTeachers = async () => {
    const { data } = await handleApiRequest<Teacher[]>({
      url: API_PATH.teachers,
      options: { method: 'GET' },
      dateFields: teacherDateFields
    });
    return data;
  };

  const createTeacher = async (teacher: Teacher) => {
    const upsertReq: TeacherUpsertReq = { ...teacher };
    await handleApiRequest({
      url: API_PATH.teachers,
      options: { method: 'POST', body: JSON.stringify(upsertReq) },
      successMessage: {
        title: "新增成功",
        description: "教職員資料已新增",
      }
    });
  };

  const updateTeacher = async (teacher: Teacher) => {
    const upsertReq: TeacherUpsertReq = { ...teacher };
    return await handleApiRequest<Teacher>({
      url: `${API_PATH.teachers}/${teacher.id}`,
      options: { method: 'PUT', body: JSON.stringify(upsertReq) },
      dateFields: teacherDateFields,
      successMessage: {
        title: "更新成功",
        description: "教職員資料已更新",
      }
    });
  };

  const deleteTeacher = async (teacher: Teacher) => {
    await handleApiRequest({
      url: `${API_PATH.teachers}/${teacher.id}`,
      options: { method: 'DELETE' },
      successMessage: {
        title: "刪除成功",
        description: "教職員資料已刪除",
      }
    });
  };

  return {
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  };
};
