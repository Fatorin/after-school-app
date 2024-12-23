export interface Teacher {
  id: string;
  username: string;
  password?: string;
  employment_type: number;
  name: string;
  phone?: string;
  responsibility?: string;
  background?: string;
  id_number?: string;
  date_of_birth?: Date;
}

export interface TeacherUpsertReq {
  username: string;
  password?: string;
  employment_type: number;
  name: string;
  phone?: string;
  responsibility?: string;
  background?: string;
  id_number?: string;
  date_of_birth?: Date;
}