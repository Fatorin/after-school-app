import { useApiRequest } from '@/hooks/use-api-request';
import { API_PATH } from './common';
import { Announcement, announcementDateFields, AnnouncementUpsertReq } from '@/types/announcement';

export const useAnnouncementApi = () => {
  const handleApiRequest = useApiRequest();

  const fetchAnnouncements = async () => {
    const { data } = await handleApiRequest<Announcement[]>({
      url: API_PATH.announcements,
      options: { method: 'GET' },
      dateFields: announcementDateFields
    });
    return data;
  };

  const createAnnouncement = async (Announcement: Announcement) => {
    const upsertReq: AnnouncementUpsertReq = { ...Announcement };
    await handleApiRequest({
      url: API_PATH.announcements,
      options: { method: 'POST', body: JSON.stringify(upsertReq) },
      successMessage: {
        title: "新增成功",
        description: "公告已新增",
      }
    });
  };

  const updateAnnouncement = async (Announcement: Announcement) => {
    const upsertReq: AnnouncementUpsertReq = { ...Announcement };
    return await handleApiRequest<Announcement>({
      url: `${API_PATH.announcements}/${Announcement.id}`,
      options: { method: 'PUT', body: JSON.stringify(upsertReq) },
      dateFields: announcementDateFields,
      successMessage: {
        title: "更新成功",
        description: "公告已更新",
      }
    });
  };

  const deleteAnnouncement = async (Announcement: Announcement) => {
    await handleApiRequest({
      url: `${API_PATH.announcements}/${Announcement.id}`,
      options: { method: 'DELETE' },
      successMessage: {
        title: "刪除成功",
        description: "公告已刪除",
      }
    });
  };

  return {
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};
