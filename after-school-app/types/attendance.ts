import { DateFieldsMap } from "./common";

export interface AttendanceRecord {
  id: string;
  note?: string;
  updated_at: Date;
  attendance_students: AttendanceStudent[]
}

export interface AttendanceStudent {
  student_id: string;
  attendance_status: boolean;
  note?: string;
}

export const attendanceDateFields: DateFieldsMap<AttendanceRecord> = {
  updated_at: true
};

export interface AttendanceRecordUpsertReq {
  note?: string;
  attendance_students: AttendanceStudent[]
}