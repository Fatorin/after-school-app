import { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from 'next';
import { StudentGradeList } from './gardes-list';

export const metadata: Metadata = {
  title: '學生成績',
};

export default function StudentGradesPage() {
  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">學生成績</h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px]" />}>
        <StudentGradeList />
      </Suspense>
    </div>
  );
}