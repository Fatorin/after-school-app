import { Suspense } from 'react';
import { MemberList } from './member-list';
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from 'next';
import { getMe } from '@/lib/api/server-auth';

export const metadata: Metadata = {
  title: '會友名單',
};


export default async function MembersPage() {
  const me = await getMe();

  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">會友名單</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <MemberList me={me} />
      </Suspense>
    </div>
  );
}