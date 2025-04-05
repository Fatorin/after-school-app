import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from 'next';
import { StudentList } from './student-list';

export const metadata: Metadata = {
  title: '學生資料',
};

export default function TeachersPage() {
  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">學生資料</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <StudentList />
      </Suspense>
    </div>
  );
}