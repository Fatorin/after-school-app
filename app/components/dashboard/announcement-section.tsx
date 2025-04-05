'use client'

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { EditDialog } from "@/components/generic_table/edit-dialog";
import { Announcement, announcementSchema, AnnouncementSchemaShape, announcementColumns, AnnouncementUpsertReq } from "@/types/announcement";
import { createFormStore } from "@/stores/form-store";
import { API_PATH } from "@/app/apis/common";
import { useCrud } from "@/hooks/use-crud";

interface AnnouncementSectionProps {
  me: {
    id: string;
    role: string;
    name: string;
  } | null;
}

const AnnouncementSection = ({ me }: AnnouncementSectionProps) => {
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const editFormStore = createFormStore(announcementSchema);
  const {
    items,
    initialized,
    isLoading,
    fetchItems,
    handleInsert,
    handleUpdate,
    handleDelete
  } = useCrud<Announcement, AnnouncementUpsertReq>({
    basePath: API_PATH.announcements,
    dateFields: {
      created_at: true,
      updated_at: true,
    }
  });

  useEffect(() => {
    if (!initialized) {
      fetchItems().catch(console.error);
    }
  }, [fetchItems, initialized]);

  // 檢查是否有權限編輯公告
  const canEditAnnouncement = useCallback((announcement: Announcement) => {
    if (!me) return false;
    return me.id === announcement.teacher_id || me.role === "super_admin";
  }, [me]);

  // 處理公告提交
  const handleAnnouncementSubmit = async (formData: Announcement) => {
    if (editingAnnouncement) {
      await handleInsert(formData);
    } else {
      await handleUpdate(formData);
    }
    fetchItems();
    setIsDialogOpen(false);
  };

  // 處理公告刪除
  const handleAnnouncementDelete = async (announcement: Announcement) => {
    if (!window.confirm('確定要刪除這則公告嗎？')) {
      return;
    }
    await handleDelete(announcement);
    await fetchItems();
  };

  return (
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
            {items.map((announcement) => (
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
            {items.length === 0 && (
              <p className="text-muted-foreground">目前沒有公告</p>
            )}
          </div>
        )}

        <EditDialog<Announcement, AnnouncementSchemaShape>
          record={editingAnnouncement}
          columns={announcementColumns}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleAnnouncementSubmit}
          useFormStore={editFormStore}
        />
      </CardContent>
    </Card>
  );
};

export default AnnouncementSection;