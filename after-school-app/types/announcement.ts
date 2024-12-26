import { z } from "zod";
import { ColumnConfig } from "./generic_table";

export interface Announcement {
  id: string;
  teacher_id: string;
  teacher_name: string;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface AnnouncementUpsertReq {
  title: string;
  content: string;
}

export type AnnouncementSchemaShape = {
  title: z.ZodString;
  content: z.ZodString;
};

const baseSchema = z.object<AnnouncementSchemaShape>({
  title: z.string().min(1, "標題不能為空"),
  content: z.string().min(1, "內容不能為空"),
});

export const announcementColumns: ColumnConfig<Announcement>[] = [
  { key: 'title', label: '標題', isCore: true, type: 'text' },
  { key: 'content', label: '內文', isCore: false, type: 'text', multiline: true },
];

const baseDefaultValues = {
  title: '',
  content: '',
};

export const announcementSchema = ({
  schemas: {
    create: baseSchema,
    update: baseSchema
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