'use client';

import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { deleteReservationById, getReservation } from '@/app/api/reservation';
import ConfirmDialog from '@/app/components/dashboard/ConfirmDialog';
import { DataTable } from '@/app/components/dashboard/DataTable';
import HeaderContent from '@/app/components/dashboard/HeaderContent';
import { LoadingOverlay } from '@/app/components/LoadingOverlay';
import ReservationForm from '@/app/components/reservation/reservation-form';
import withAuth from '@/app/components/withAuth';
import { RESERVATION_STATUS_OPTIONS } from '@/app/constants/reservationOptions';
import { useApp } from '@/app/context/AppContext';
import { STATUS_LABELS, STATUS_STYLES, type ReservationStatus } from '@/app/enums/reservation';
import { UserRole } from '@/app/enums/user-account';
import { useActionWithLoading } from '@/app/hooks/useActionWithLoading';
import type Reservation from '@/app/models/features/reservation';
import { formatDate } from '@/app/utils/formatDateUTC';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/datepicker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Download, EllipsisVertical, Mail, PhoneCall, PlusCircle, RotateCcwIcon, SquareArrowRight, Trash } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type btnActions = 'CREATE' | 'UPDATE' | 'SEE' | 'PRINT' | 'NULL';

function ConsultingSchedule() {
  const params = useParams();

  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [reLoadData, setReLoadData] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const [actions, setActions] = useState<btnActions>('CREATE');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [openConfirm, setOpenConfirm] = useState(false);

  const { role } = useApp();

  const { isLoadingAction, execute } = useActionWithLoading();

  const fetchReservation = async () => {
    setIsLoading(true);
    try {
      const response = await getReservation(page, limit, total, {
        query: searchValue,
        status: statusFilter,
        startDate: startDate ? formatDate(startDate) : '',
        endDate: endDate ? formatDate(endDate) : '',
      });

      setReservations(response.reservations);
      setTotal(response.pagination.total);
      setLimit(response.pagination.limit);
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [page, limit, searchValue, reLoadData, startDate, endDate, statusFilter]);

  const handleUpdate = async (resource: Reservation) => {
    setActions('UPDATE');
    setIsDialogOpen(true);
    setReservation(resource);
  };

  const handleDelete = async (resource: Reservation) => {
    execute(
      async () => {
        const request = await deleteReservationById(resource.id);
        if (request) {
          if (resource?.file) await deletefileDataUploadthing(resource?.file);
          await fetchReservation();
        }
      },
      {
        successMessage: 'Đã xóa đặt lịch thành công',
        errorMessage: 'Đã xóa đặt lịch thất bại',
      },
    );
  };

  const handleDeleteMultiple = async (resources: Reservation[]) => {
    if (resources.length === 0) {
      toast.warning('Không có mục nào để xóa');
      return;
    }

    // try {
    //   const deletePromises = resources.map(async (resource) => {
    //     const request = await deleteReservationById(resource.id);
    //     if (request) {
    //       if (resource?.file) await deletefileDataUploadthing(resource?.file);
    //       return { success: true, id: resource.id };
    //     } else {
    //       return { success: false, id: resource.id };
    //     }
    //   });

    //   const results = await Promise.all(deletePromises);

    //   const failedDeletes = results.filter((res) => !res.success);

    //   if (failedDeletes.length > 0) {
    //     toast.error(`Xóa thất bại ${failedDeletes.length} đặt lịch`);
    //   } else {
    //     toast.success('Đã xóa tất cả đặt lịch');
    //     setOpenConfirm(false);
    //   }

    //   fetchReservation();
    // } catch (error: any) {
    //   toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    // }

    execute(
      async () => {
        const deletePromises = resources.map(async (resource) => {
          const request = await deleteReservationById(resource.id);
          if (request) {
            if (resource?.file) await deletefileDataUploadthing(resource?.file);
            return { success: true, id: resource.id };
          } else {
            return { success: false, id: resource.id };
          }
        });
        await Promise.all(deletePromises);

        setOpenConfirm(false);
        await fetchReservation();
      },
      {
        successMessage: 'Đã xóa tất cả đặt lịch',
        errorMessage: `Xóa thất bại tất cả đặt lịch`,
      },
    );
  };

  const handleCreate = () => {
    setActions('CREATE');
    setIsDialogOpen(true);
    setReservation(null);
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date as Date);
    // console.log('Selected Date:', date);
  };

  const handleSEndDateChange = (date: Date | undefined) => {
    setEndDate(date as Date);
    // console.log('Selected Date:', date);
  };

  // Column Table
  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'fullName',
      header: 'HỌ VÀ TÊN',
      cell: ({ row }) => {
        const fullName = row.getValue('fullName') as string | null;
        return <span className="font-medium">{fullName ? fullName.toUpperCase() : 'Không có tên'}</span>;
      },
    },
    {
      accessorKey: 'gmail',
      header: 'GMAIL',
      cell: ({ row }) => {
        const gmail = row.getValue('gmail') as string | null;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-orange-600 font-bold" />
            <span className="font-medium text-muted-foreground">{gmail || 'Không có email'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'SỐ ĐIỆN THOẠI',
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string | null;
        return (
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-green-600 font-bold animate-bounce" />
            <span className="font-medium text-muted-foreground">{phone || 'Không có số'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'consultDate',
      header: 'NGÀY HẸN',
      cell: ({ row }) => {
        const date = row.getValue('consultDate') as string | null;
        return <span className="text-orange-500 font-bold">{date ? format(date, 'dd-MM-yyyy') : 'Chưa xác định'}</span>;
      },
    },
    {
      accessorKey: 'createdDate',
      header: 'NGÀY TẠO',
      cell: ({ row }) => {
        const date = row.getValue('createdDate') as string | null;
        return <span>{date ? format(date, 'dd-MM-yyyy') : 'Chưa xác định'}</span>;
      },
    },
    ...(params?.schedule_category === 'contact'
      ? [
          {
            accessorKey: 'file',
            header: 'ĐÍNH KÈM',
            cell: ({ row }: any) => {
              const fileUrl = row.getValue('file') as string | null;
              return fileUrl ? (
                <a href={fileUrl} download className="flex items-center gap-2 text-blue-600 hover:underline">
                  <Download className="h-4 w-4" />
                  Tải xuống
                </a>
              ) : (
                <span className="text-gray-400">Không có tệp</span>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: 'status',
      header: 'TRẠNG THÁI',
      cell: ({ row }) => {
        const status = row.getValue('status') as ReservationStatus | null;
        const statusLabel = status ? STATUS_LABELS[status] : 'Không xác định';
        const statusStyle = status ? STATUS_STYLES[status] : 'bg-gray-100 text-gray-500';

        return (
          <Badge variant="outline" className={cn('flex items-center px-2 py-1 rounded-md w-max', statusStyle)}>
            {statusLabel}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'HÀNH ĐỘNG',
      cell: ({ row }) => {
        const resource = row.original;

        if (role !== UserRole.GLOBAL_ADMIN) return null;

        return (
          <div className="justify-center flex">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem onClick={() => handleUpdate(resource)}>
                  <SquareArrowRight />
                  Tiếp nhận thông tin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(resource)}>
                  <div className="text-red-500 flex items-center gap-2">
                    <Trash />
                    <span> Xóa</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="">
      <LoadingOverlay visible={isLoadingAction} />

      <HeaderContent title="Tư Vấn - Liên Hệ" subTitle="Danh sách thông tin tư vấn - liên hệ" />

      <Card className="px-4 py-2 shadow-md">
        {/* Search Input */}
        <div className="flex flex-wrap items-center gap-2 py-4">
          <Input
            placeholder="Tìm kiếm theo tên.."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-sm sm:w-full"
          />

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {RESERVATION_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="w-full lg:w-[250px] lg:ml-4">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-primary">Từ ngày /</Label>
              <DatePicker
                onDateChange={handleStartDateChange}
                startYear={1900}
                dateValue={startDate as Date}
                endYear={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="w-full lg:w-[250px] lg:ml-4">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-primary">Đến ngày /</Label>
              <DatePicker
                onDateChange={handleSEndDateChange}
                startYear={1900}
                dateValue={endDate as Date}
                endYear={new Date().getFullYear()}
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSearchValue('');
              setStatusFilter('');
              setStartDate(null);
              setEndDate(null);
              setPage(1);
            }}
          >
            <RotateCcwIcon className="w-6 h-6" />
          </Button>

          <div className="ml-auto">
            <div className="flex items-center gap-2">
              {statusFilter === 'CONFIRMED' && (
                <Button
                  onClick={() => setOpenConfirm(true)}
                  variant="link"
                  className="w-full sm:w-auto ring-1 ring-red-500 text-red-500 rounded-md p-3 hover:bg-red-100 hover:text-red-600 transition animate-pulse"
                >
                  <Trash className="w-6 h-6" />
                </Button>
              )}

              {role === UserRole.GLOBAL_ADMIN && (
                <Button variant="default" className="w-full sm:w-auto" onClick={handleCreate}>
                  <PlusCircle className="w-6 h-6" />
                  Tạo
                </Button>
              )}
            </div>

            <ReservationForm
              mode={actions}
              reservation={reservation!}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              reloadData={() => setReLoadData((prev) => !prev)}
            />

            <ConfirmDialog
              title="Bạn có chắn xóa tất cả các đặt lịch đã hoàn tất ?"
              openConfirm={openConfirm}
              setOpenConfirm={() => setOpenConfirm(false)}
              btnConfirm={() => handleDeleteMultiple(reservations)}
            />
          </div>
        </div>

        <Separator className="mt-3 mb-6 text-muted-foreground" />

        {/* Data Table */}
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={reservations}
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Card>
    </div>
  );
}

export default withAuth(ConsultingSchedule);
