import { ColumnConfig } from "@/types/generic_table";
import { z, ZodNullable } from "zod";
import { Student } from "./student";

export interface StudentGrade {
  id: string;
  name: string;
  student_id: string;
  academic_year: number;
  semester: number;
  exam_type: number;
  chinese_score?: number;
  english_score?: number;
  math_score?: number;
  science_score?: number;
  social_studies_score?: number;
  comment?: string;
  updated_at: Date;
}

export interface StudentGradeUpsertReq {
  student_id: string;
  academic_year: number;
  semester: number;
  exam_type: number;
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
  chinese_score: ZodNullable<z.ZodNumber>;
  english_score: ZodNullable<z.ZodNumber>;
  math_score: ZodNullable<z.ZodNumber>;
  science_score: ZodNullable<z.ZodNumber>;
  comment: ZodNullable<z.ZodString>;
};

const baseFields = z.object({
  // 基本資料
  student_id: z.string().nonempty('請選擇要輸入資料的對象'),
  academic_year: z.number(),
  semester: z.number(),
  exam_type: z.number(),
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
    isCore: true,
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
    label: '考試類別',
    isCore: true,
    type: 'enum',
    options: [
      { value: 0, label: '期中考' },
      { value: 1, label: '期末考' },
    ]
  },
  { key: 'exam_type', label: '國文', type: 'number' },
  { key: 'chinese_score', label: '英文', type: 'number' },
  { key: 'english_score', label: '數學', type: 'number' },
  { key: 'math_score', label: '自然', type: 'number' },
  { key: 'science_score', label: '社會', type: 'number' },
  { key: 'comment', label: '備註', type: 'text' },
  { key: 'updated_at', label: '更新時間', type: 'date', viewOnly: true },
];

const baseDefaultValues = {
  student_id: '',
  academic_year: 0,
  semester: 0,
  exam_type: 0,
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