import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BaseRecord, QuickListProps } from "@/types/generic_table";
import { format, isValid } from "date-fns";

export function SearchList<T extends BaseRecord>({
  data,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  displayField,
  subDisplayField,
  columns
}: QuickListProps<T>) {
  const formatDisplayValue = (record: T, field: keyof T): string => {
    const value = record[field];
    const column = columns.find(col => col.key === field);

    if (value == null || value === '') return '';

    if (column?.type === 'enum') {
      return column.options?.find(opt => opt.value === value)?.label ?? '';
    }

    if (column?.type === 'boolean') {
      return (value as boolean) ? '是' : '否';
    }

    if (column?.type === 'date') {
      return isValid(value) ? format(value as string, 'yyyy-MM-dd') : '';
    }

    return String(value);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {data.map(record => {
          const mainDisplay = formatDisplayValue(record, displayField);
          const subDisplay = formatDisplayValue(record, subDisplayField);

          return (
            <button
              key={record.id}
              onClick={() => onSelect(record)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                "border-b last:border-b-0",
                selectedId === record.id && "bg-muted"
              )}
            >
              <div className="font-medium">
                {mainDisplay || <span className="text-muted-foreground">未設定</span>}
              </div>
              {subDisplay && (
                <div className="text-sm text-muted-foreground">
                  {subDisplay}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}