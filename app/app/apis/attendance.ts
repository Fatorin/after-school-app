import { useApiRequest } from '@/hooks/use-api-request';
import { API_PATH } from './common';
import { attendanceDateFields, AttendanceRecord, AttendanceRecordUpsertReq } from '@/types/attendance';

export const useAttendanceApi = () => {
  const handleApiRequest = useApiRequest();

  const fetchRecord = async (date: string) => {
    const { data } = await handleApiRequest<AttendanceRecord>({
      url: `${API_PATH.attendances}?date=${date}`,
      options: { method: 'GET' },
      dateFields: attendanceDateFields
    });
    return data;
  };

  const createRecord = async (record: AttendanceRecord) => {
    const upsertReq: AttendanceRecordUpsertReq = { ...record };
    await handleApiRequest({
      url: `${API_PATH.attendances}/${record.id}`,
      options: { method: 'POST', body: JSON.stringify(upsertReq) },
      successMessage: {
        title: "新增成功",
        description: "簽到記錄已新增",
      }
    });
  };

  const updateRecord = async (record: AttendanceRecord) => {
    const upsertReq: AttendanceRecordUpsertReq = { ...record };
    console.log(JSON.stringify(upsertReq));
    return await handleApiRequest({
      url: `${API_PATH.attendances}/${record.id}`,
      options: { method: 'PUT', body: JSON.stringify(upsertReq) },
      successMessage: {
        title: "更新成功",
        description: "簽到記錄已更新",
      }
    });
  };

  return {
    fetchRecord,
    createRecord,
    updateRecord,
  };
};
