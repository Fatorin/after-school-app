'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student } from '@/types/student';
import { AttendanceRecord, AttendanceStudent } from '@/types/attendance';
import { useCrud } from '@/hooks/use-crud';
import { API_PATH } from '../apis/common';
import { useAttendanceApi } from '../apis/attendance';

const AttendanceTable = () => {
  const {
    items: students,
    fetchItems: fetchStudents,
    initialized: fetchStudentsInitialized,
  } = useCrud<Student>({
    basePath: API_PATH.students,
    dateFields: {
      date_of_birth: true
    }
  });

  const { fetchRecord, createRecord, updateRecord } = useAttendanceApi();
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [lastFetchedDate, setLastFetchedDate] = useState<string>('');

  const fetchAttendanceRecords = useCallback(async (date: string): Promise<void> => {
    if (date === lastFetchedDate) return;

    try {
      const data = await fetchRecord(date);
      if (data) {
        setAttendanceRecord(data);
        const studentAttendanceMap = data.attendance_students.reduce<Record<string, boolean>>(
          (acc, student) => {
            acc[student.student_id] = student.attendance_status;
            return acc;
          },
          {}
        );
        setSelectedStudents(studentAttendanceMap);
        setNote(data.note || '');
      } else {
        setAttendanceRecord(null);
        setSelectedStudents({});
        setNote('');
      }
    } catch (error) {
      setAttendanceRecord(null);
      setSelectedStudents({});
      setNote('');
      console.error('Error fetching attendance records:', error);
    } finally {
      setLastFetchedDate(date);
    }
  }, [fetchRecord, lastFetchedDate]);

  useEffect(() => {
    if (!fetchStudentsInitialized) {
      fetchStudents().catch(console.error);
      fetchAttendanceRecords(selectedDate).catch(console.error);
    }
  }, [fetchStudents, fetchStudentsInitialized, fetchAttendanceRecords, selectedDate]);

  const handleAttendanceSubmit = async (): Promise<void> => {
    const recordData: AttendanceRecord = {
      id: selectedDate,
      note: note,
      updated_at: new Date(),
      attendance_students: Object.entries(selectedStudents)
        .map(([studentId, status]): AttendanceStudent => ({
          student_id: studentId,
          attendance_status: status,
          note: ''
        }))
    };

    try {
      if (attendanceRecord) {
        // 如果已有記錄，執行更新
        await updateRecord(recordData);
      } else {
        // 如果沒有記錄，建立新記錄
        await createRecord(recordData);
      }
      // 清除快取並重新獲取資料
      setLastFetchedDate('');
      void fetchAttendanceRecords(selectedDate);
    } catch (error) {
      console.error('Error handling attendance record:', error);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setLastFetchedDate('');
    void fetchAttendanceRecords(date);
  };

  const handleCheckboxChange = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: checked
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>簽到紀錄</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border rounded p-2"
              />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="備註"
                className="border rounded p-2"
              />
              <Button onClick={() => void handleAttendanceSubmit()}>
                {attendanceRecord ? '更新簽到紀錄' : '送出簽到紀錄'}
              </Button>
            </div>
            {attendanceRecord ? (
              <span className="text-sm text-gray-500">
                最後更新時間：{new Date(attendanceRecord.updated_at).toLocaleString()}
              </span>
            ) : (
              <span className="text-sm text-gray-500">尚未上傳紀錄</span>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>出席</TableHead>
                <TableHead>學生姓名</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents[student.id] || false}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(student.id, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTable;