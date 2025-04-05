import { ColumnConfig } from "@/types/generic_table";
import { z, ZodNullable } from "zod";
import { DateFieldsMap } from "./common";

export interface Student {
  id: string;
  name: string;
  gender?: number;
  id_number?: string;
  date_of_birth?: Date;
  school_name?: string;
  grade?: string;
  is_pg?: boolean;
  description?: string;
  family_type?: string;
  family_members?: number;
  breadwinner?: string;
  occupation?: string;
  subsidy?: string;
  address?: string;
  home_ownership?: string;
  home_phone_number?: string;
  mobile_phone_number?: string;
  line_id?: string;
  comment?: string;
  joined_at: Date;
}

export const studentDateFields: DateFieldsMap<Student> = {
  joined_at: true
};

export interface StudentUpsertReq {
  name: string;
  gender?: number;
  id_number?: string;
  date_of_birth?: Date;
  school_name?: string;
  grade?: string;
  is_pg?: boolean;
  description?: string;
  family_type?: string;
  family_members?: number;
  breadwinner?: string;
  occupation?: string;
  subsidy?: string;
  address?: string;
  home_ownership?: string;
  home_phone_number?: string;
  mobile_phone_number?: string;
  chinese_book?: string,
  english_book?: string,
  math_book?: string,
  science_book?: string,
  social_studies_book?: string,
  line_id?: string;
  comment?: string;
  joined_at: Date;
}


export type StudentSchemaShape = {
  // 基本資料
  name: z.ZodString;
  gender: z.ZodNumber;
  id_number: z.ZodString;
  date_of_birth: ZodNullable<z.ZodString>;
  is_pg: z.ZodBoolean;
  description: ZodNullable<z.ZodString>;
  family_type: ZodNullable<z.ZodString>;
  family_members: ZodNullable<z.ZodNumber>;
  breadwinner: ZodNullable<z.ZodString>;
  occupation: ZodNullable<z.ZodString>;
  subsidy: ZodNullable<z.ZodString>;
  address: ZodNullable<z.ZodString>;
  home_ownership: ZodNullable<z.ZodString>;
  home_phone_number: ZodNullable<z.ZodString>;
  mobile_phone_number: ZodNullable<z.ZodString>;

  // 其他欄位
  line_id: ZodNullable<z.ZodString>;
  comment: ZodNullable<z.ZodString>;
  joined_at: z.ZodDate;
};


const baseFields = z.object({
  // 基本資料
  name: z.string().min(2, '名稱至少要2個字'),
  id_number: z.string().min(10, '格式不正確').max(10, '格式不正確'),
  gender: z.number(),
  date_of_birth: z.string().nullable(),
  is_pg: z.boolean(),
  description: z.string().nullable(),
  family_type: z.string().nullable(),
  family_members: z.number().nullable(),
  breadwinner: z.string().nullable(),
  occupation: z.string().nullable(),
  subsidy: z.string().nullable(),
  address: z.string().nullable(),
  home_ownership: z.string().nullable(),
  home_phone_number: z.string().nullable(),
  mobile_phone_number: z.string().nullable(),

  // 教育相關
  chinese_book: z.string().nullable(),
  english_book: z.string().nullable(),
  math_book: z.string().nullable(),
  science_book: z.string().nullable(),
  social_studies_book: z.string().nullable(),

  // 其他欄位
  line_id: z.string().nullable(),
  comment: z.string().nullable(),
  joined_at: z.date(),
});

export const studentColumns: ColumnConfig<Student>[] = [
  { key: 'name', label: '姓名', type: 'text' },
  {
    key: 'gender',
    label: '性別',
    type: 'enum',
    options: [
      { value: 0, label: '男性' },
      { value: 1, label: '女性' },
    ]
  },
  { key: 'id_number', label: '身份證字號', type: 'text' },
  { key: 'date_of_birth', label: '生日', type: 'date' },
  { key: 'school_name', label: '學校名稱', type: 'text' },
  { key: 'is_pg', label: 'PG生', type: 'boolean' },
  { key: 'description', label: '家庭情況', type: 'text', multiline: true },
  { key: 'family_type', label: '家庭組成', type: 'text' },
  { key: 'family_members', label: '家庭成員', type: 'number' },
  { key: 'breadwinner', label: '經濟來源', type: 'text' },
  { key: 'occupation', label: '職業', type: 'text' },
  { key: 'subsidy', label: '補助', type: 'text' },
  { key: 'address', label: '地址', type: 'text' },
  {
    key: 'home_ownership',
    label: '居住類型',
    type: 'enum',
    options: [
      { value: 0, label: '自有' },
      { value: 1, label: '租賃' },
    ]
  },
  { key: 'home_phone_number', label: '市話', type: 'text' },
  { key: 'mobile_phone_number', label: '手機', type: 'text' },
  { key: 'line_id', label: 'LINE ID', type: 'text' },
  { key: 'comment', label: '備註', type: 'text' },
  { key: 'joined_at', label: '加入時間', type: 'date' },
];

const baseDefaultValues = {
  name: '',
  id_number: '',
  gender: 0,
  date_of_birth: null,
  is_pg: false,
  description: null,
  family_type: null,
  family_members: 0,
  breadwinner: null,
  occupation: null,
  subsidy: null,
  address: null,
  home_ownership: null,
  home_phone_number: null,
  mobile_phone_number: null,
  chinese_book: null,
  english_book: null,
  math_book: null,
  science_book: null,
  social_studies_book: null,
  line_id: null,
  comment: null,
  joined_at: new Date(),
};

export const studentSchema = ({
  schemas: {
    create: baseFields,
    update: baseFields
  },
  defaultValues: {
    create: {
      ...baseDefaultValues,
    },
    update: {
      ...baseDefaultValues,
    }
  }
})