'use client'

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import AnnouncementSection from "@/components/dashboard/announcement-section";
import { useEffect } from "react";

const HomePage = () => {
  const router = useRouter();
  const { me, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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

      {/* 公告區域組件 */}
      <AnnouncementSection me={me} />
    </div>
  );
};

export default HomePage;