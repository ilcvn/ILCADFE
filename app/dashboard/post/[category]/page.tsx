'use client';

import { deleteArticleById, getArticles, translate } from '@/app/api/article';
import { DataTable } from '@/app/components/dashboard/DataTable';
import HeaderContent from '@/app/components/dashboard/HeaderContent';
import withAuth from '@/app/components/withAuth';
import { ARTICLE_TYPE_LABEL, ARTICLE_TYPE_STYLES, type ArticleType } from '@/app/enums/article';
import type Article from '@/app/models/features/arcicle';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, EllipsisVertical, EyeIcon, Languages, PlusCircle, RotateCcwIcon, Trash } from 'lucide-react';
import Image from 'next/image';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { useApp } from '@/app/context/AppContext';
import { UserRole } from '@/app/enums/user-account';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LANGUAGE_OPTIONS } from '@/app/constants/languageOptions';
import { LoadingOverlay } from '@/app/components/LoadingOverlay';
import { useActionWithLoading } from '@/app/hooks/useActionWithLoading';

const translateDictionary = {
  [LANGUAGE_OPTIONS[0].value]: ['EN', 'Tạo bản sao Tiếng Anh', 'ZH', 'Tạo bản sao Tiếng Trung'],
  [LANGUAGE_OPTIONS[1].value]: ['VI', 'Tạo bản sao Tiếng Việt', 'ZH', 'Tạo bản sao Tiếng Trung'],
  [LANGUAGE_OPTIONS[2].value]: ['VI', 'Tạo bản sao Tiếng Việt', 'EN', 'Tạo bản sao Tiếng Anh'],
};

const PostPage = () => {
  const params = useParams();
  const navigation = useRouter();

  const validCategories = ['training', 'service', 'news', 'research'];

  if (!validCategories.includes(params?.category as string)) {
    notFound();
  }

  const [searchValue, setSearchValue] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState(params?.category?.toString().toUpperCase());
  const [languageFilter, setLanguageFilter] = useState<string>(LANGUAGE_OPTIONS[0].value);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reLoadData, setReLoadData] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { role } = useApp();

  const { isLoadingAction, execute } = useActionWithLoading();

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      const response = await getArticles(page, limit, total, {
        search: searchValue,
        type: typeFilter,
        language: languageFilter,
      });

      setArticles(response.articles);
      setTotal(response.pagination.total);
      setLimit(response.pagination.limit);
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [page, limit, searchValue, typeFilter, languageFilter, reLoadData]);

  const toCreatePost = () => {
    switch (params?.category) {
      case 'training':
        navigation.push(`/dashboard/generate-post/training`);
        break;
      case 'service':
        navigation.push(`/dashboard/generate-post/service`);
        break;
      case 'news':
        navigation.push(`/dashboard/generate-post/news`);
        break;
      case 'research':
        navigation.push(`/dashboard/generate-post/research`);
        break;

      default:
        toast.error('Đường dẫn không tồn tại');
        navigation.push(`${params?.category}`);
        break;
    }
  };

  const handleDelete = async (resource: Article) => {
    execute(
      async () => {
        const request = await deleteArticleById(resource.id);
        if (request) {
          if (resource?.preview_img) await deletefileDataUploadthing(resource?.preview_img);
          await fetchArticle();
        }
      },
      { successMessage: 'Đã xóa bài báo thành công', errorMessage: 'Xóa bài báo thất bại' },
    );
  };

  const handleTranslation = async (id: number, fromLanguage: string, toLanguage: string) => {
    execute(
      async () => {
        const request = await translate(id, fromLanguage, toLanguage);
        if (request) {
          await fetchArticle();
        }
      },
      { successMessage: 'Tạo bản sao thành công', errorMessage: 'Tạo bản sao thất bại' },
    );
  };

  const columns: ColumnDef<Article>[] = [
    {
      accessorKey: 'preview_img',
      header: 'HÌNH ẢNH',
      cell: ({ row }) => {
        return (
          <Image
            width={150}
            height={30}
            src={row.getValue('preview_img') || '/defaultImage.png'}
            alt=""
            className="object-cover rounded-md"
          />
        );
      },
    },
    {
      accessorKey: 'title',
      header: 'TIÊU ĐỀ',
      cell: ({ row }) => <span className="font-bold text-md text-primary">{row.getValue('title')}</span>,
    },
    {
      accessorKey: 'type',
      header: 'THỂ LOẠI',
      cell: ({ row }) => {
        const article = row.getValue('type') as ArticleType;
        const articleLabel = ARTICLE_TYPE_LABEL[article] || 'Không xác định';
        const articleStyle = ARTICLE_TYPE_STYLES[article] || 'bg-gray-100 text-gray-500';

        return (
          <Badge variant="outline" className={cn('flex items-center px-2 py-1 rounded-md w-max', articleStyle)}>
            {articleLabel}
          </Badge>
        );
      },
    },

    {
      accessorKey: 'views',
      header: 'LƯỢT XEM',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <EyeIcon className="w-4 h-4 text-muted-foreground animate-pulse" />
          <span className="text-primary font-semibold">{row.getValue('views')}</span>
        </div>
      ),
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
      accessorKey: 'updateDate',
      header: 'NGÀY CẬP NHẬT',
      cell: ({ row }) => {
        const date = row.getValue('updateDate') as string;
        return <span>{format(date, 'dd-MM-yyyy')}</span>;
      },
    },
    {
      id: 'actions',
      header: 'HÀNH ĐỘNG',
      cell: ({ row }) => {
        const article = row.original;

        return (
          <div className="flex space-x-2">
            {role === UserRole.GLOBAL_ADMIN && (
              <Button variant="ghost" size="sm" onClick={() => navigation.push(`/dashboard/update-post/${article?.id}`)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem onClick={() => navigation.push(`/dashboard/detail-post/${article?.id}`)}>
                  <EyeIcon />
                  Xem chi tiết
                </DropdownMenuItem>

                {/* Tạo bản sao */}
                {<DropdownMenuItem onClick={() => handleTranslation(Number(article?.id), languageFilter, translateDictionary[languageFilter][0])}>
                  <Languages />
                  {translateDictionary[languageFilter][1]}
                </DropdownMenuItem>}

                {<DropdownMenuItem onClick={() => handleTranslation(Number(article?.id), languageFilter, translateDictionary[languageFilter][2])}>
                    <Languages />
                    {translateDictionary[languageFilter][3]}
                  </DropdownMenuItem>}

                {role === UserRole.GLOBAL_ADMIN && (
                  <DropdownMenuItem onClick={() => handleDelete(article)}>
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

      <HeaderContent title="Bài Báo" subTitle="Quản lý thông tin bài báo" />

      <Card className="px-4 py-2 shadow-md">
        {/* Search Input */}
        <div className="flex flex-wrap items-center gap-2 py-4">
          <Input
            placeholder="Tìm kiếm bài báo.."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="max-w-sm sm:w-full"
          />

          <Button
            variant="outline"
            onClick={() => {
              setSearchValue('');
              setPage(1);
              setLanguageFilter(LANGUAGE_OPTIONS[0].value);
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
              <Button variant="default" className="w-full sm:w-auto" onClick={toCreatePost}>
                <PlusCircle className="w-6 h-6" />
                Tạo
              </Button>
            )}
          </div>
        </div>

        <Separator className="mt-3 mb-6 text-muted-foreground" />

        {/* Data Table */}
        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={articles}
          page={page}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Card>
    </div>
  );
};

export default withAuth(PostPage);
