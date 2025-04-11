import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ban, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  total: number;
  limit: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  total,
  limit,
  isLoading,
  onPageChange,
  onLimitChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const totalPages = Math.ceil(total / limit);

  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisiblePages = 4;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const left = Math.max(2, page - 1);
      const right = Math.min(totalPages - 1, page + 1);

      pages.push(1);

      if (left > 2) {
        pages.push('...');
      }

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages.map((p, idx) =>
      p === '...' ? (
        <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
          ...
        </span>
      ) : (
        <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(p as number)}>
          {p}
        </Button>
      ),
    );
  };

  return (
    <>
      {/* Table */}
      <div className="relative w-full max-h-[520px] lg:max-h-[550px] overflow-auto">
        <Table className="min-w-max">
          <TableHeader className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground font-bold text-md">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground text-md font-semibold">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="mx-auto flex flex-col items-center gap-2 text-muted-foreground text-md font-semibold">
                    <p className="">Không có dữ liệu.</p>
                    <Ban className="w-4 h-4" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {page !== 0 && total !== 0 && limit !== 0 && (
        <div className="flex flex-wrap items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </div>

          <div className="flex space-x-2">
            <Select value={limit.toString()} onValueChange={(value) => onLimitChange(Number(value))}>
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue placeholder={limit.toString()} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <Button key={num} variant={page === num ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(num)}>
                {num}
              </Button>
            ))} */}

            {renderPaginationButtons()}

            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
