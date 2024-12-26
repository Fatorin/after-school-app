'use client'

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { EditDialog } from "@/components/generic_table/edit-dialog";
import { Announcement, announcementSchema, AnnouncementSchemaShape, announcementColumns } from "@/types/announcement";
import { createFormStore } from "@/stores/form-store";
import { useApiRequest } from "@/hooks/use-api-request";
import { useRouter } from "next/navigation";

const API_PATH = {
  announcements: `${process.env.NEXT_PUBLIC_API_URL}/api/announcements`,
  teachers: `${process.env.NEXT_PUBLIC_API_URL}/api/teachers`,
};

const HomePage = () => {
  const router = useRouter();
  const { me, loading: authLoading, isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const editFormStore = createFormStore(announcementSchema);
  const handleApiRequest = useApiRequest();

  // 獲取公告列表
  const fetchAnnouncements = useCallback(async () => {
    if (!isAuthenticated) return; // 只在已認證時執行
    
    try {
      setIsLoading(true);
      const result = await handleApiRequest(API_PATH.announcements, { method: 'GET' });
      setAnnouncements(result.data);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiRequest, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnnouncements();
    }
  }, [fetchAnnouncements, isAuthenticated]);

  // 檢查是否有權限編輯公告
  const canEditAnnouncement = useCallback((announcement: Announcement) => {
    if (!me) return false;
    return me.id === announcement.teacher_id || me.role === "super_admin";
  }, [me]);

  // 處理公告提交
  const handleAnnouncementSubmit = async (formData: Partial<Announcement>) => {
    if (!isAuthenticated || !me) return;

    const endpoint = editingAnnouncement
      ? `${API_PATH.announcements}/${editingAnnouncement.id}`
      : API_PATH.announcements;
    const method = editingAnnouncement ? "PUT" : "POST";

    const data = {
      ...formData,
      authorId: me.id,
      authorName: me.name,
    };

    await handleApiRequest(
      endpoint,
      {
        method,
        body: JSON.stringify(data),
      },
      {
        title: editingAnnouncement ? "更新成功" : "新增成功",
        description: editingAnnouncement ? "公告已更新" : "公告已新增",
      }
    );

    await fetchAnnouncements();
    setIsDialogOpen(false);
  };

  // 處理公告刪除
  const handleAnnouncementDelete = async (announcement: Announcement) => {
    if (!isAuthenticated || !me) return;
    
    if (!window.confirm('確定要刪除這則公告嗎？')) {
      return;
    }

    const endpoint = `${API_PATH.announcements}/${announcement.id}`;

    await handleApiRequest(
      endpoint,
      {
        method: "DELETE",
      },
      {
        title: "刪除成功",
        description: "公告已刪除",
      }
    );

    await fetchAnnouncements();
  };

  // 如果認證狀態還在載入中，顯示載入畫面
  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-8">
        <Card>
          <CardContent className="p-6 flex justify-center items-center">
            <p className="text-muted-foreground">載入中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 如果未認證，重定向到登入頁面
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-8 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            {me?.name} 歡迎使用學生管理系統
          </h1>
          <p className="text-muted-foreground">
            請從上方導航欄選擇您要使用的功能。
          </p>
        </CardContent>
      </Card>

      {/* 公告區 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">系統公告</h2>
            <Button
              onClick={() => {
                setEditingAnnouncement(null);
                setIsDialogOpen(true);
              }}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              新增公告
            </Button>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">載入中...</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{announcement.title}</h3>
                    {canEditAnnouncement(announcement) && (
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAnnouncement(announcement);
                            setIsDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnnouncementDelete(announcement)}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <span>作者：{announcement.teacher_name}</span>
                    <span className="ml-4">
                      最後更新：{new Date(announcement.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-muted-foreground">目前沒有公告</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EditDialog<Announcement, AnnouncementSchemaShape>
        record={editingAnnouncement}
        columns={announcementColumns}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAnnouncementSubmit}
        useFormStore={editFormStore}
      />
    </div>
  );
};

export default HomePage;