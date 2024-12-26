import { format, isValid } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { BaseRecord, ColumnConfig, EnumSelectProps } from '@/types/generic_table';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "../ui/date-picker";

export function createGenericColumns<T extends BaseRecord>({
  columnConfigs,
  onEdit,
  canEdit,
}: {
  columnConfigs: ColumnConfig<T>[];
  onEdit: (record: T) => void;
  canEdit: (record: T) => boolean;
}): ColumnDef<T>[] {
  return [
    ...columnConfigs.map(config => ({
      accessorKey: String(config.key),
      header: config.label,
      enableHiding: !config.isCore,
    })),
    {
      id: "actions",
      header: "管理",
      enableHiding: false,
      cell: ({ row }) => {
        const record = row.original;
        return canEdit(record) ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(record)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : null;
      }
    }
  ];
}

export function EnumSelect({ value, onChange, options, disabled = false }: EnumSelectProps) {
  return (
    <Select
      value={String(value)}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="請選擇" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={String(option.value)} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface RenderFieldProps<T extends BaseRecord> {
  column: ColumnConfig<T>;
  value: unknown;
  onChange?: (value: unknown) => void;
  error?: string;
  isEditing?: boolean;
  isNewRecord?: boolean;
}

export function renderField<T extends BaseRecord>({
  column,
  value,
  onChange,
  error,
  isEditing = false,
  isNewRecord = false
}: RenderFieldProps<T>) {
  switch (column.type) {
    case 'password':
      if (!isEditing) return null;
      return (
        <div className="space-y-2">
          <Input
            type="password"
            value={String(value || '')}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={isNewRecord ? "請輸入密碼" : "若不修改請留空"}
            className={cn(error && "border-destructive")}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );

    case 'date':
      let dateValue: Date | undefined;

      if (value instanceof Date) {
        dateValue = isValid(value) ? value : undefined;
      } else if (typeof value === 'string') {
        const parsedDate = new Date(value);
        dateValue = isValid(parsedDate) ? parsedDate : undefined;
      }

      if (isEditing) {
        return (
          <div className="space-y-2">
            <DatePicker
              date={dateValue}
              onChange={(date) => {
                if (date && isValid(date)) {
                  // 將日期轉換為 ISO 字串格式
                  onChange?.(date);
                } else {
                  onChange?.(null);
                }
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      }
      return <p>{dateValue ? format(dateValue, 'yyyy-MM-dd') : ''}</p>;

    case 'enum':
      const options = column.options || [];
      if (isEditing) {
        return (
          <div className="space-y-2">
            <EnumSelect
              value={value as string | number}
              onChange={val => onChange?.(val)}
              options={options}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      }
      return <p>{options.find(opt => opt.value === value)?.label ?? ''}</p>;

    case 'boolean':
      if (isEditing) {
        return (
          <div className="space-y-2">
            <EnumSelect
              value={(value as boolean) ? 1 : 0}
              onChange={(val) => onChange?.(val === '1')}
              options={[
                { value: 1, label: '是' },
                { value: 0, label: '否' }
              ]}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      }
      return <p>{(value as boolean) ? '是' : '否'}</p>;

    default:
      if (column.multiline) {
        if (isEditing) {
          return (
            <div className="space-y-2">
              <Textarea
                value={String(value || '')}
                onChange={(e) => onChange?.(e.target.value)}
                className={cn("min-h-[100px]", error && "border-destructive")}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          );
        }
        return <p className="whitespace-pre-wrap">{String(value || '')}</p>;
      }

      if (isEditing) {
        return (
          <div className="space-y-2">
            <Input
              type={column.type}
              value={String(value || '')}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(error && "border-destructive")}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );
      }
      return <p>{String(value || '')}</p>;
  }
}