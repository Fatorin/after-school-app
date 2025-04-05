import { Metadata } from 'next';
import AttendanceTable from './attendance-table';

export const metadata: Metadata = {
  title: '簽到表',
};

export default function AttendancePage() {
  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">簽到表</h1>
      <AttendanceTable />
    </div>
  );
}
