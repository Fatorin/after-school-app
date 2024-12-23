import { Suspense } from 'react';
import { TeacherList } from './teacher-list';
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '教職人員名單',
};

export default function TeachersPage() {
  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">教職人員名單</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <TeacherList />
      </Suspense>
    </div>
  );
}