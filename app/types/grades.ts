import { z, ZodNullable } from "zod";
import { Student } from "./student";
import { DateFieldsMap } from "./common";
import { ColumnConfig } from "./generic-table";

export interface StudentGrade {
  id: string;
  name: string;
  student_id: string;
  academic_year: number;
  semester: number;
  exam_type: number;
  chinese_book?: string,
  english_book?: string,
  math_book?: string,
  science_book?: string,
  social_studies_book?: string,
  chinese_score?: number;
  english_score?: number;
  math_score?: number;
  science_score?: number;
  social_studies_score?: number;
  comment?: string;
  updated_at: Date;
}

export const studentGradeDateFields: DateFieldsMap<StudentGrade> = {
  updated_at: true
};

export interface StudentGradeUpsertReq {
  student_id: string;
  academic_year: number;
  semester: number;
  exam_type: number;
  chinese_book?: string,
  english_book?: string,
  math_book?: string,
  science_book?: string,
  social_studies_book?: string,
  chinese_score?: number;
  english_score?: number;
  math_score?: number;
  science_score?: number;
  social_studies_score?: number;
  comment?: string;
}

export type StudentGradeSchemaShape = {
  student_id: z.ZodString;
  academic_year: z.ZodNumber;
  semester: z.ZodNumber;
  exam_type: z.ZodNumber;
  chinese_book: ZodNullable<z.ZodString>;
  english_book: ZodNullable<z.ZodString>;
  math_book: ZodNullable<z.ZodString>;
  science_book: ZodNullable<z.ZodString>;
  social_studies_book: ZodNullable<z.ZodString>;
  chinese_score: ZodNullable<z.ZodNumber>;
  english_score: ZodNullable<z.ZodNumber>;
  math_score: ZodNullable<z.ZodNumber>;
  science_score: ZodNullable<z.ZodNumber>;
  social_studies_score: ZodNullable<z.ZodNumber>;
  comment: ZodNullable<z.ZodString>;
};

const baseFields = z.object({
  // 基本資料
  student_id: z.string().nonempty('請選擇要輸入資料的對象'),
  academic_year: z.number(),
  semester: z.number(),
  exam_type: z.number(),
  chinese_book: z.string().nullable(),
  english_book: z.string().nullable(),
  math_book: z.string().nullable(),
  science_book: z.string().nullable(),
  social_studies_book: z.string().nullable(),
  chinese_score: z.number().nullable(),
  english_score: z.number().nullable(),
  math_score: z.number().nullable(),
  science_score: z.number().nullable(),
  comment: z.string().nullable(),
});


export const createStudentGradeColumns = (students: Student[]): ColumnConfig<StudentGrade>[] => [
  {
    key: 'student_id',
    label: '學生',
    type: 'enum',
    options: students.map(student => ({
      value: student.id,
      label: student.name
    })),
    hidden: true,
  },
  {
    key: 'name',
    label: "姓名",
    viewOnly: true,
  },
  { key: 'academic_year', label: '學年', type: 'number' },
  {
    key: 'semester',
    label: '學期',
    type: 'enum',
    options: [
      { value: 0, label: '上學期' },
      { value: 1, label: '下學期' },
    ]
  }, {
    key: 'exam_type',
    label: '考試類別',
    type: 'enum',
    options: [
      { value: 0, label: '期中考' },
      { value: 1, label: '期末考' },
    ]
  },
  { key: 'chinese_book', label: '國文課本', type: 'text' },
  { key: 'english_book', label: '英文課本', type: 'text' },
  { key: 'math_book', label: '數學課本', type: 'text' },
  { key: 'science_book', label: '自然課本', type: 'text' },
  { key: 'social_studies_book', label: '社會課本', type: 'text' },
  { key: 'chinese_score', label: '國文', type: 'number' },
  { key: 'english_score', label: '英文', type: 'number' },
  { key: 'math_score', label: '數學', type: 'number' },
  { key: 'science_score', label: '自然', type: 'number' },
  { key: 'social_studies_score', label: '社會', type: 'number' },
  { key: 'comment', label: '備註', type: 'text' },
  { key: 'updated_at', label: '更新時間', type: 'date', viewOnly: true },
];

const baseDefaultValues = {
  id: null,
  name: '',
  student_id: '',
  academic_year: 0,
  semester: 0,
  exam_type: 0,
  chinese_book: null,
  english_book: null,
  math_book: null,
  science_book: null,
  social_studies_book: null,
  chinese_score: null,
  english_score: null,
  math_score: null,
  science_score: null,
  social_studies_score: null,
  comment: null,
  updated_at: new Date(),
};

export const studentGradeSchema = ({
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