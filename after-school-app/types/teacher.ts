import { ColumnConfig } from "@/types/generic_table";
import { z, ZodDate, ZodNullable, ZodString } from "zod";

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

export type TeacherSchemaShape = {
  name: z.ZodString;
  employment_type: z.ZodNumber;
  username: z.ZodString;
  password: z.ZodString | ZodNullable<ZodString>;
  date_of_birth: ZodNullable<ZodDate>;
  id_number: ZodNullable<ZodString>;
  phone: ZodNullable<ZodString>;
  responsibility: ZodNullable<ZodString>;
  background: ZodNullable<ZodString>;
};

const baseFields = {
  name: z.string().min(2, '名稱至少要2個字'),
  employment_type: z.number().min(0).max(2),
  username: z.string().min(4, '帳號至少要4個字'),
  phone: z.string().min(10, '連絡電話為必填').nullable(),
  date_of_birth: z.date().nullable(),
  id_number: z.string().nullable(),
  responsibility: z.string().nullable(),
  background: z.string().nullable()
};

const createSchema = z.object<TeacherSchemaShape>({
  ...baseFields,
  password: z.string().min(8, '密碼至少需要8個字元')
});

const updateSchema = z.object<TeacherSchemaShape>({
  ...baseFields,
  password: z.string().min(8, '密碼至少需要8個字元').nullable()
});

export const teacherColumns: ColumnConfig<Teacher>[] = [
  { key: 'name', label: '姓名', isCore: true, type: 'text' },
  {
    key: 'employment_type',
    label: '雇用型態',
    isCore: true,
    type: 'enum',
    options: [
      { value: 0, label: '全職' },
      { value: 1, label: '兼職' },
      { value: 2, label: '志工' }
    ]
  },
  { key: 'username', label: '帳號', isCore: true, type: 'text' },
  { key: 'password', label: '密碼', isCore: false, type: 'password', hidden: true },
  { key: 'date_of_birth', label: '生日', type: 'date' },
  { key: 'id_number', label: '身份證字號', type: 'text' },
  { key: 'phone', label: '連絡電話', isCore: true, type: 'text' },
  { key: 'responsibility', label: '職責', type: 'text' },
  { key: 'background', label: '學經歷', type: 'text', multiline: true }
];

const baseDefaultValues = {
  employment_type: 0,
  name: '',
  username: '',
  phone: null,
  date_of_birth: null,
  id_number: null,
  responsibility: null,
  background: null
};

export const teacherSchema = ({
  schemas: {
    create: createSchema,
    update: updateSchema
  },
  defaultValues: {
    create: {
      ...baseDefaultValues,
      password: ''
    },
    update: {
      ...baseDefaultValues,
      password: null
    }
  }
})