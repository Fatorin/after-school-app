import { z, ZodDate, ZodNullable, ZodString } from "zod";
import { ColumnConfig } from "./generic-table";

export interface Member {
  id: string;
  name: string;
  id_number?: string;
  birth_date?: Date;
  home_phone_number?: string;
  mobile_phone_number?: string;
  address?: string;
  title?: string;
  line_id?: string;
  comment?: string;
  joined_at: Date;
}

export interface MemberUpsertRequest {
  name: string;
  id_number?: string;
  birth_date?: Date;
  home_phone_number?: string;
  mobile_phone_number?: string;
  address?: string;
  title?: string;
  line_id?: string;
  comment?: string;
  joined_at: Date;
}

export type MemberSchemaShape = {
  name: ZodString;
  id_number?: ZodNullable<ZodString>;
  birth_date?: ZodNullable<ZodDate>;
  home_phone_number?: ZodNullable<ZodString>;
  mobile_phone_number?: ZodNullable<ZodString>;
  address?: ZodNullable<ZodString>;
  title?: ZodNullable<ZodString>;
  line_id?: ZodNullable<ZodString>;
  comment?: ZodNullable<ZodString>;
  joined_at: ZodDate;
};

const baseFields = {
  name: z.string().min(2, '名稱至少要2個字'),
  joined_at: z.date()
};

const schema = z.object<MemberSchemaShape>({
  ...baseFields,
});

export const memberColumns: ColumnConfig<Member>[] = [
  { key: 'name', label: '姓名', type: 'text' },
  { key: 'id_number', label: '身份證字號', type: 'text' },
  { key: 'home_phone_number', label: '市話', type: 'text' },
  { key: 'mobile_phone_number', label: '手機', type: 'text' },
  { key: 'address', label: '住址', type: 'text' },
  { key: 'title', label: '稱謂', type: 'text' },
  { key: 'line_id', label: 'LINE ID', type: 'text' },
  { key: 'birth_date', label: '生日', type: 'date' },
  { key: 'joined_at', label: '加入時間', type: 'date' },
];

const baseDefaultValues = {
  name: '',
  id_number: null,
  birth_date: null,
  home_phone_number: null,
  mobile_phone_number: null,
  address: null,
  title: null,
  line_id: null,
  comment: null,
  joined_at: new Date(),
};

export const memberSchema = ({
  schemas: {
    create: schema,
    update: schema
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