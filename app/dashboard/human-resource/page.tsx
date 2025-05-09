'use client';

import { DataTable } from '@/app/components/dashboard/DataTable';
import HeaderContent from '@/app/components/dashboard/HeaderContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Edit,
  EllipsisVertical,
  EyeIcon,
  IdCard,
  Languages,
  Mail,
  PhoneCall,
  PlusCircle,
  RotateCcwIcon,
  Trash,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import HumanResourceForm from '../../components/human-resource/human-resoure-form';
import type HumanResource from '@/app/models/features/human-resource';
import withAuth from '@/app/components/withAuth';
import {
  deleteHumanResourceById,
  getHumanResource,
  getImageUrl,
  translate,
  updateHumanResourceById,
} from '@/app/api/human-resource';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HUMAN_RESOURCE_ROLE_STYLES, HUMAN_RESOURCE_ROLES_LABEL, type HumanResourceRole } from '@/app/enums/human-resource.enum';
import { cn } from '@/lib/utils';
import { HUMAN_RESOURCE_OPTIONS } from '@/app/constants/humanResourceOption';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { useApp } from '@/app/context/AppContext';
import { UserRole } from '@/app/enums/user-account';
import { LANGUAGE_OPTIONS } from '@/app/constants/languageOptions';
import { useActionWithLoading } from '@/app/hooks/useActionWithLoading';
import { LoadingOverlay } from '@/app/components/LoadingOverlay';

type btnActions = 'CREATE' | 'UPDATE' | 'SEE' | 'PRINT' | 'NULL';

const translateDictionary = {
  [LANGUAGE_OPTIONS[0].value]: ['EN', 'Tạo bản sao Tiếng Anh', 'ZH', 'Tạo bản sao Tiếng Trung'],
  [LANGUAGE_OPTIONS[1].value]: ['VI', 'Tạo bản sao Tiếng Việt', 'ZH', 'Tạo bản sao Tiếng Trung'],
  [LANGUAGE_OPTIONS[2].value]: ['VI', 'Tạo bản sao Tiếng Việt', 'EN', 'Tạo bản sao Tiếng Anh'],
};

function HumanResourcePage() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>(LANGUAGE_OPTIONS[0].value);
  const [isShowFilter, setIsShowFilter] = useState<string>('');
  const [humanResources, setHumanResources] = useState<HumanResource[]>([]);
  const [humanResource, setHumanResource] = useState<HumanResource | null>(null);
  const [reLoadData, setReLoadData] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [actions, setActions] = useState<btnActions>('CREATE');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const { role } = useApp();

  const { isLoadingAction, execute } = useActionWithLoading();

  const navigation = useRouter();

  const fetchHumanResource = async () => {
    setIsLoading(true);
    try {
      const response = await getHumanResource(page, limit, total, {
        query: searchValue,
        role: roleFilter,
        language: languageFilter,
        isShow: isShowFilter,
      });
      setHumanResources(response.members);
      setLimit(response.pagination.limit);
      setTotal(response.pagination.total);
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHumanResource();
  }, [page, limit, searchValue, roleFilter, languageFilter, isShowFilter, reLoadData]);

  const handleUpdate = (resource: HumanResource) => {
    setActions('UPDATE');
    setIsDialogOpen(true);
    setHumanResource(resource);
  };

  const handleDelete = async (resource: HumanResource) => {
    execute(
      async () => {
        const request = await deleteHumanResourceById(resource.id);
        if (request) {
          if (resource?.imgUrl) {
            const countImageUrl = await getImageUrl(resource.imgUrl);
            if (countImageUrl === 0) {
              await deletefileDataUploadthing(resource?.imgUrl);
            }
          }
          await fetchHumanResource();
        }
      },
      {
        successMessage: 'Đã xóa nhân sự thành công',
        errorMessage: 'Xóa nhân sự thất bại',
      },
    );
  };

  const handleCreate = () => {
    setActions('CREATE');
    setIsDialogOpen(true);
    setHumanResource(null);
  };

  const handleToggleShow = async (resource: HumanResource, checked: boolean) => {
    execute(
      async () => {
        resource.isShow = checked;
        const requestBody = {
          fullName: resource?.fullName,
          description: resource?.description,
          gmail: resource?.gmail,
          imgUrl: resource?.imgUrl,
          phone: resource?.phone,
          role: resource?.role,
          isShow: resource?.isShow,
        };
        const request = await updateHumanResourceById(requestBody, resource.id);
        if (request) {
          await fetchHumanResource();
        }
      },
      {
        successMessage: 'Cập nhật trạng thái thành công!',
        errorMessage: 'Cập nhật trạng thái thất bại!',
      },
    );
  };

  const handleTranslation = (id: number, fromLanguage: string, toLanguage: string) => {
    execute(
      async () => {
        const request = await translate(id, fromLanguage, toLanguage);
        if (request) {
          await fetchHumanResource();
        }
      },
      {
        successMessage: 'Tạo bản sao thành công!',
        errorMessage: 'Tạo bản sao thất bại!',
      },
    );
  };

  // Colunm Table
  const columns: ColumnDef<HumanResource>[] = [
    {
      accessorKey: 'imgUrl',
      header: 'ẢNH',
      cell: ({ row }) => {
        const name = row.getValue('fullName') as string;
        return (
          <Avatar className="h-20 w-20 rounded-md object-cover">
            <AvatarImage src={row.getValue('imgUrl')} alt={name} />
            <AvatarFallback className="rounded-lg">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: 'penName',
      header: 'DANH XƯNG',
      cell: ({ row }) => {
        const penNames = (row.getValue('penName') as string).split(',').map((penName) => penName.trim()) || [];
        return (
          <div className="flex flex-wrap w-36 gap-2">
            {penNames.map((penName, index) => {
              const penNameLabel = penName;
              return (
                <div key={index} className="flex items-center">
                  <span>{penNameLabel}</span>
                  {index < penNames.length - 1 && <span className="">{','}</span>}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: 'fullName',
      header: 'HỌ VÀ TÊN',
      cell: ({ row }) => {
        const fullName = row.getValue('fullName') as string;
        return <span className="font-medium">{fullName?.toUpperCase()}</span>;
      },
    },
    {
      accessorKey: 'phone',
      header: 'SỐ ĐIỆN THOẠI',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-green-600 font-bold animate-bounce" />
          <span className="font-medium text-muted-foreground">{row.getValue('phone') || 'Chưa có số điện thoại'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'gmail',
      header: 'GMAIL',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-orange-600 font-bold" />
          <span className="font-medium text-muted-foreground">{row.getValue('gmail') || 'Chưa có gmail'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'CHỨC VỤ',
      cell: ({ row }) => {
        const roles = (row.getValue('role') as string).split(',').map((role) => role.trim()) || [];

        return (
          <div className="flex flex-col items-start gap-2">
            {roles.map((role, index) => {
              const roleLabel = HUMAN_RESOURCE_ROLES_LABEL[role as HumanResourceRole] || 'Không xác định';
              const roleStyle = HUMAN_RESOURCE_ROLE_STYLES[role as HumanResourceRole] || 'bg-gray-100 text-gray-500';

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <Badge variant="outline" className={cn('flex items-center px-2 py-1 rounded-md w-max', roleStyle)}>
                    {roleLabel}
                  </Badge>
                  {/* {index < roles.length - 1 && <Link2 className="w-4 h-4 ml-1 text-gray-400" />} */}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: 'createDate',
      header: 'NGÀY TẠO',
      cell: ({ row }) => {
        const date = row.getValue('createDate') as string;
        return <span>{format(date, 'dd-MM-yyyy')}</span>;
      },
    },
    {
      accessorKey: 'isShow',
      header: 'HIỂN THỊ',
      cell: ({ row }) => {
        const isShow = row.getValue('isShow') as boolean;
        return (
          <Switch
            disabled={role !== UserRole.GLOBAL_ADMIN}
            checked={isShow}
            onCheckedChange={(checked) => handleToggleShow(row.original, checked)}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'HÀNH ĐỘNG',
      cell: ({ row }) => {
        const resource = row.original;

        return (
          <div className="flex space-x-2">
            {/* Chỉ GLOBAL_ADMIN mới có quyền chỉnh sửa */}
            {role === UserRole.GLOBAL_ADMIN && (
              <Button variant="ghost" size="sm" onClick={() => handleUpdate(resource)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem onClick={() => navigation.push(`/dashboard/human-resource-detail/${resource?.id}`)}>
                  <EyeIcon />
                  Xem chi tiết
                </DropdownMenuItem>

                {/* Chỉ GLOBAL_ADMIN mới có quyền Add profile  */}
                {/* {role === UserRole.GLOBAL_ADMIN && (
                  <DropdownMenuItem onClick={() => navigation.push(`/dashboard/generate-human-detail/${resource?.id}`)}>
                    <IdCard />
                    Cập nhật hồ sơ
                  </DropdownMenuItem>
                )} */}

                {/* Tạo bản sao */}
                {
                  <DropdownMenuItem
                    onClick={() =>
                      handleTranslation(Number(resource?.id), languageFilter, translateDictionary[languageFilter][0])
                    }
                  >
                    <Languages />
                    {translateDictionary[languageFilter][1]}
                  </DropdownMenuItem>
                }

                {
                  <DropdownMenuItem
                    onClick={() =>
                      handleTranslation(Number(resource?.id), languageFilter, translateDictionary[languageFilter][2])
                    }
                  >
                    <Languages />
                    {translateDictionary[languageFilter][3]}
                  </DropdownMenuItem>
                }

                {/* Chỉ GLOBAL_ADMIN mới có quyền xóa */}
                {role === UserRole.GLOBAL_ADMIN && (
                  <DropdownMenuItem onClick={() => handleDelete(resource)}>
                    <div className="text-red-500 flex items-center gap-2">
                      <Trash />
                      <span> Xóa</span>
                    </div>
                  </DropdownMenuItem>
                )}
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

      <HeaderContent title="Nhân Sự" subTitle="Quản lý thông tin nhân sự" />

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
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Lọc theo chức vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {HUMAN_RESOURCE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={isShowFilter}
            onValueChange={(value) => {
              setIsShowFilter(value);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="true">Hiển thị</SelectItem>
                <SelectItem value="false">Ẩn đi</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchValue('');
              setRoleFilter('');
              setIsShowFilter('');
              setLanguageFilter(LANGUAGE_OPTIONS[0].value);
              setPage(1);
            }}
          >
            <RotateCcwIcon className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <Select
              value={languageFilter}
              onValueChange={(value) => {
                setLanguageFilter(value);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Lọc theo ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {LANGUAGE_OPTIONS.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {role === UserRole.GLOBAL_ADMIN && (
              <Button variant="default" className="w-full sm:w-auto" onClick={handleCreate}>
                <PlusCircle className="w-6 h-6" />
                Tạo
              </Button>
            )}

            <HumanResourceForm
              mode={actions}
              humanResource={humanResource!}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              reloadData={() => setReLoadData((prev) => !prev)}
            />
          </div>
        </div>

        <Separator className="mt-3 mb-6 text-muted-foreground" />

        {/* Data Table */}
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={humanResources}
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

export default withAuth(HumanResourcePage);
