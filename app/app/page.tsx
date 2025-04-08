import { redirect } from "next/navigation";
import AnnouncementSection from "@/components/dashboard/announcement-section";
import { getMe } from '@/lib/api/server-auth';

const HomePage = async () => {
  const me = await getMe();
  if (!me) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8 px-8 space-y-6">
      <h1 className="text-2xl font-bold">{me.name} 歡迎使用教會社群系統</h1>
      <AnnouncementSection me={me} />
    </div>
  );
};

export default HomePage;