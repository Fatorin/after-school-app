import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Loader2, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { BaseRecord } from "@/types/generic_table";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<T extends BaseRecord> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
}

export function DataTable<T extends BaseRecord>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    const initialVisibility: VisibilityState = {};
    columns.forEach((column: ColumnDef<T>) => {
      if (column.id) {
        initialVisibility[column.id] = true;
      }
    });
    setColumnVisibility(initialVisibility);
  }, [columns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      table.getColumn("name")?.setFilterValue(event.target.value);
    },
    [table]
  );

  const handleToggleAll = useCallback((checked: boolean) => {
    const newVisibility: VisibilityState = {};
    table.getAllColumns()
      .filter((column) => column.id !== 'actions')
      .forEach((column) => {
        if (column.id) {
          newVisibility[column.id] = checked;
        }
      });
    table.setColumnVisibility(newVisibility);
  }, [table]);

  const handleReset = useCallback(() => {
    const defaultVisibility: VisibilityState = {};
    table.getAllColumns()
      .filter((column) => column.id !== 'actions')
      .forEach((column) => {
        if (column.id) {
          defaultVisibility[column.id] = true;
        }
      });
    table.setColumnVisibility(defaultVisibility);
  }, [table]);

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((_, index) => (
                <TableHead key={index} className="px-6">
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((_, cellIndex) => (
                  <TableCell key={cellIndex} className="px-6">
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜尋..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={handleSearchChange}
            className="w-[200px]"
            disabled={isLoading}
          />
          <span className="text-sm text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `共 ${table.getFilteredRowModel().rows.length} 筆資料`
            )}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading}>
              顯示欄位 <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuCheckboxItem
              checked={table.getIsAllColumnsVisible()}
              onCheckedChange={(checked) => handleToggleAll(checked)}
              onSelect={(e) => {
                e.preventDefault();
              }}
              className="border-b"
            >
              全選/取消全選
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((c) => c.id !== 'actions')
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleReset}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                重設預設值
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers
                  .filter(header => header.column.getIsVisible())
                  .map((header) => (
                    <TableHead key={header.id} className="px-6">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => header.column.toggleSorting()}
                            className="-ml-3 h-8"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-2">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </Button>
                        </div>
                      )}
                    </TableHead>
                  ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="px-6">
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().filter(col => col.getIsVisible()).length}
                  className="h-24 text-center px-6"
                >
                  沒有資料
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          第 {table.getState().pagination.pageIndex + 1} 頁，
          共 {table.getPageCount()} 頁
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            上一頁
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            下一頁
          </Button>
        </div>
      </div>
    </div>
  );
}