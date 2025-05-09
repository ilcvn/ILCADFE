'use client';

import { createArticle, getImageUrl } from '@/app/api/article';
import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { SubmitButton } from '@/app/components/dashboard/SubmitButton';
import withAuth from '@/app/components/withAuth';
import { ARTICLE_OPTIONS } from '@/app/constants/articleOptions';
import { LANGUAGE_OPTIONS } from '@/app/constants/languageOptions';
import { useApp } from '@/app/context/AppContext';
import { ARTICLE_TYPE_LABEL, ArticleType } from '@/app/enums/article';
import { UserRole } from '@/app/enums/user-account';
import { articleFormSchema, type ArticleFormData } from '@/app/schemas/article-schema';
import Editor from '@/components/editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadDropzone } from '@/lib/uploadthing';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import Image from 'next/image';
import { notFound, redirect, useParams, useRouter } from 'next/navigation';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

function GeneratePostDynamic() {
  const params = useParams();

  const navigation = useRouter();

  const [currentPreviewImage, setCurrentPreviewImage] = useState('');

  const [labelType, setLabelType] = useState<String | null>('');

  const validCategories = ['training', 'service', 'news', 'research'];

  const [isUploading, setIsUploading] = useState(false);

  const { role } = useApp();

  if (role !== UserRole.GLOBAL_ADMIN) redirect(`/dashboard/post/${params?.generate_category}`);

  if (!validCategories.includes(params?.generate_category as string)) {
    notFound();
  }

  const {
    register,
    setValue,
    trigger,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: { title: '', content: '', preview_img: '', summary: '', type: '', language: '' },
  });

  const generateTypeByParam = (param: string) => {
    const convertParam = param?.toLocaleUpperCase();
    if (Object.values(ArticleType).includes(convertParam as ArticleType)) {
      setLabelType(ARTICLE_TYPE_LABEL[convertParam as ArticleType]);
    }
  };

  const [state, submitAction, isPending] = useActionState(async (prevState: any, formData: ArticleFormData) => {
    try {
      const request = await createArticle(formData);
      if (request) {
        toast.success('Tạo bài báo thành công!');
        reset({ title: '', content: '', preview_img: '', summary: '', type: '' });
        navigation.push(`/dashboard/post/${params?.generate_category}`);
      } else {
        toast.error('Tạo bài báo thất bại!');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    }
  }, undefined);

  let content = watch('content');
  content = '<h2>Tiêu đề</h2><p>Giới thiệu ngắn về bài viết</p>';

  const onSubmit = (data: ArticleFormData) => {
    startTransition(() => {
      submitAction(data);
    });
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      let request;
      if (imageUrl) {
        const countImageUrl = await getImageUrl(imageUrl);
        if (countImageUrl === 1 || countImageUrl === 0) {
          request = await deletefileDataUploadthing(imageUrl);
        }
      }
      setCurrentPreviewImage('');
      setValue('preview_img', '');
      toast.success(request || 'File và hình ảnh đã được xóa');
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    const selectedArticleOption = ARTICLE_OPTIONS.find((option) => option.value.toLowerCase() === params?.generate_category);
    setValue('type', selectedArticleOption?.value as string);
    setValue('language', LANGUAGE_OPTIONS[0].value);
    generateTypeByParam(params?.generate_category as string);
  }, []);

  const generateTypeArticle = () => {
    const selectedArticleOption = ARTICLE_OPTIONS.find((option) => option.value.toLowerCase() === params?.generate_category);

    if (!selectedArticleOption) return null;

    return (
      <div className="flex flex-col gap-y-2 col-span-1">
        <Label>Loại bài báo</Label>
        <Select
          disabled
          defaultValue={selectedArticleOption.value}
          onValueChange={(value) => {
            setValue('type', value);
            trigger('type');
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn loại bài báo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ARTICLE_OPTIONS.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
      </div>
    );
  };

  return (
    <div className="">
      <Card className="px-4 py-2 shadow-md">
        <CardHeader>
          <CardTitle className="text-primary">Tạo Bài Báo Mới</CardTitle>
          <CardDescription>Hãy điền thông tin bài báo để hoàn tất đăng bài</CardDescription>
          <CardDescription>
            <Badge className="mt-1">{labelType}</Badge>
          </CardDescription>
        </CardHeader>
        <form
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <CardContent className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tiêu đề */}
                <div className="flex flex-col gap-y-2 sm:col-span-2 lg:col-span-1">
                  <Label>Tiêu đề</Label>
                  <Input id="title" className="w-full" placeholder="Nhập tiêu đề" {...register('title')} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>

                {/* Tóm tắt */}
                <div className="flex flex-col gap-y-2 col-span-1 sm:col-span-2 lg:col-span-2">
                  <Label>Tóm tắt</Label>
                  <Input id="summary" className="w-full" placeholder="Nội dung tóm tắt" {...register('summary')} />
                  {errors.summary && <p className="text-red-500 text-sm">{errors.summary.message}</p>}
                </div>

                {/* Loại bài báo */}
                {generateTypeArticle()}

                {/* Hình ảnh xem trước */}
                <div className="flex flex-col gap-y-2 col-span-1 sm:col-span-2 lg:col-span-4 mb-2">
                  <Label>Hình ảnh xem trước</Label>
                  <Input
                    id="imgPath"
                    {...register('preview_img')}
                    value={currentPreviewImage}
                    onChange={(e) => setValue('preview_img', e.target.value)}
                    className="sr-only"
                  />
                  {currentPreviewImage ? (
                    <div className="relative w-full sm:w-[400px] lg:w-[600px] h-auto">
                      <Image
                        src={currentPreviewImage}
                        alt="profileImage"
                        className="object-cover rounded-md w-full h-auto"
                        width={600}
                        height={300}
                      />
                      <Button
                        onClick={() => handleDeleteImage(currentPreviewImage)}
                        variant="destructive"
                        className="absolute w-6 h-6 -top-3 -right-3 rounded-full"
                        type="button"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <UploadDropzone
                      onUploadBegin={() => setIsUploading(true)}
                      onClientUploadComplete={(res) => {
                        const url = res[0].ufsUrl;
                        setCurrentPreviewImage(url);
                        setValue('preview_img', url);
                        setIsUploading(false);
                        toast.success('Hình ảnh của bạn đã được upload');
                      }}
                      onUploadError={(error) => {
                        toast.error(error.message);
                      }}
                      endpoint="singleImageUploader"
                    />
                  )}
                  {errors.preview_img && <p className="text-red-500 text-sm">{errors.preview_img.message}</p>}
                </div>

                {/* Ngôn ngữ */}
                <div className="flex flex-col gap-y-2 col-span-1">
                  <Label>Chọn ngôn ngữ bài báo</Label>
                  <Select
                    defaultValue={LANGUAGE_OPTIONS[0].value}
                    onValueChange={(value) => {
                      setValue('language', value);
                      trigger('language');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
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
                  {errors.language && <p className="text-red-500 text-sm">{errors.language.message}</p>}
                </div>

                {/* Nội dung bài báo */}
                <div className="flex flex-col gap-y-2 col-span-1 sm:col-span-2 lg:col-span-4">
                  <Label>Nội dung bố cục bài báo</Label>
                  <Editor value={content} onChange={(value) => setValue('content', value)} />
                  {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton text="Lưu / Đăng bài" variant="default" isPending={isPending || isPending} />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default withAuth(GeneratePostDynamic);
