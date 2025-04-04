'use client';

import { SubmitButton } from '@/app/components/dashboard/SubmitButton';
import withAuth from '@/app/components/withAuth';
import { useApp } from '@/app/context/AppContext';
import { UserRole } from '@/app/enums/user-account';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { redirect, useParams, useRouter } from 'next/navigation';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { humanResourceDetailFormSchema, type humanResourceDetailFormData } from '@/app/schemas/human-resource-detail-schema';
import { getHumanResourceById, updateHumanResourceById } from '@/app/api/human-resource';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HUMAN_RESOURCE_TYPE_DETAIL_OPTIONS } from '@/app/constants/humanResourceDetailOption';
import type HumanResourceDetail from '@/app/models/features/human-resource-detail';
import type HumanResource from '@/app/models/features/human-resource';

function MemberDetaiPage() {
  const params = useParams();

  const navigation = useRouter();

  const { role } = useApp();

  if (role !== UserRole.GLOBAL_ADMIN) redirect(`/dashboard/post/${params?.generate_category}`);

  const [humanDetailsListAdd, setHumanDetailsListAdd] = useState<HumanResourceDetail[]>([]);

  const [humanResource, setHumanResource] = useState<HumanResource | null>(null);

  const [state, submitAction, isPending] = useActionState(async (prevState: any, formData: humanResourceDetailFormData) => {
    try {
      const request = await updateHumanResourceById(formData, params?.id as string);
      if (request) {
        toast.success('Cập nhật hồ sơ thành công!');
        reset({});
        navigation.push(`/dashboard/human-resource`);
      } else {
        toast.error('Cập nhật hồ sơ thất bại!');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    }
  }, undefined);

  const onSubmit = (data: humanResourceDetailFormData) => {
    if (data) {
      for (let i = 0; i < data.memberDetails.length; i++) {
        if (data.memberDetails[i].fromDate === '' || data.memberDetails[i].toDate === '') {
          data.memberDetails[i].fromDate = '01/2020';
          data.memberDetails[i].toDate = '12/2020';
        }
      }
    }
    startTransition(() => {
      submitAction(data);
    });
  };

  const addHumanDetail = () => {
    setHumanDetailsListAdd([
      ...humanDetailsListAdd,
      {
        id: '',
        memberID: params?.id as string,
        title: '',
        description: '',
        typeDetail: HUMAN_RESOURCE_TYPE_DETAIL_OPTIONS[0].value,
        place: '',
        fromDate: '',
        toDate: '',
      },
    ]);
  };

  const deleteHumanDetailItem = (index: number) => {
    setHumanDetailsListAdd((prevDetails) => prevDetails.filter((_, i) => i !== index));
  };

  const {
    register,
    setValue,
    trigger,
    watch,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<humanResourceDetailFormData>({
    resolver: zodResolver(humanResourceDetailFormSchema),
    defaultValues: {
      memberDetails: [{ memberID: '', title: '', description: '', typeDetail: '', place: '', fromDate: '', toDate: '' }],
    },
  });

  const onSubmitForUpdate = async () => {
    if (humanDetailsListAdd.length > 0) {
      for (let i = 0; i < humanDetailsListAdd.length; i++) {
        if (humanDetailsListAdd[i].fromDate === '' || humanDetailsListAdd[i].toDate === '') {
          humanDetailsListAdd[i].fromDate = '01/2020';
          humanDetailsListAdd[i].toDate = '12/2020';
        }
      }
    }

    try {
      const request = await updateHumanResourceById({ memberDetails: humanDetailsListAdd }, params?.id as string);
      if (request) {
        toast.success('Cập nhật hồ sơ thành công!');
        reset({});
        navigation.push(`/dashboard/human-resource`);
      } else {
        toast.error('Cập nhật hồ sơ thất bại!');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    }
  };

  useEffect(() => {
    const fetchHumanResources = async () => {
      try {
        const data = await getHumanResourceById(params?.id as string);

        // Kiểm tra member có tồn tại hay không
        if (data!.memberDetails.length > 0) {
          // @ts-ignore
          const formattedDetails = data!.memberDetails.map(({ __v, _id, updateDate, createDate, ...detail }) => ({
            ...detail,
            typeDetail: detail.typeDetail || '',
            place: detail.place || '',
            fromDate: detail.fromDate || '',
            toDate: detail.toDate || '',
          }));
          setHumanDetailsListAdd(formattedDetails);
          reset({ memberDetails: formattedDetails });
        }
      } catch (error: any) {
        toast.error('Tạo thành viên trước khi cập nhật hồ sơ');
        redirect('/dashboard/human-resource');
      }
    };

    fetchHumanResources();
  }, [params?.id, reset]);

  useEffect(() => {
    if (humanDetailsListAdd.length > 0) {
      reset({ memberDetails: humanDetailsListAdd });
    }
  }, [humanDetailsListAdd, reset]);

  useEffect(() => {
    setValue('memberDetails', humanDetailsListAdd);
  }, [humanDetailsListAdd, setValue]);

  const handleChange = (index: number, field: keyof humanResourceDetailFormData['memberDetails'][number], value: string) => {
    setHumanDetailsListAdd((prevDetails) =>
      prevDetails.map((detail, i) => (i === index ? { ...detail, [field]: value } : detail)),
    );
  };

  return (
    <div className="">
      <Card className="px-4 py-2 shadow-md">
        <CardHeader>
          <CardTitle className="text-primary">Hồ sơ thành viên</CardTitle>
          <CardDescription>Cập nhật hồ sơ thành viên tại đây</CardDescription>
        </CardHeader>
        <form
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <CardContent className="max-h-[650px] overflow-y-auto">
            <div className="relative border-l-4 border-gray-300 pl-6 space-y-6">
              {humanDetailsListAdd.map((humanDetail, index) => (
                <div key={index} className="relative pl-6">
                  <div className="absolute left-[-34px] top-2 w-4 h-4 bg-primary rounded-full"></div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-3">
                      <div className="flex flex-col gap-y-2 sm:col-span-2 lg:col-span-2">
                        <Label>Bắt đầu từ</Label>
                        <Input
                          placeholder="10/2020"
                          className="w-full"
                          value={humanDetail.fromDate}
                          onChange={(e) => handleChange(index, 'fromDate', e.target.value)}
                        />
                        {errors.memberDetails?.[index]?.fromDate && (
                          <p className="text-red-500 text-sm">{errors.memberDetails[index].fromDate.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-y-2 sm:col-span-2 lg:col-span-2">
                        <Label>Kết thúc</Label>
                        <Input
                          placeholder="10/2022"
                          className="w-full"
                          value={humanDetail.toDate}
                          onChange={(e) => handleChange(index, 'toDate', e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-y-2 sm:col-span-2 lg:col-span-2">
                        <Label>Loại cột mốc</Label>
                        <Select
                          defaultValue={humanDetail.typeDetail || HUMAN_RESOURCE_TYPE_DETAIL_OPTIONS[0].value}
                          onValueChange={(value) => handleChange(index, 'typeDetail', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn cột mốc" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {HUMAN_RESOURCE_TYPE_DETAIL_OPTIONS.map((typeDetail) => (
                                <SelectItem key={typeDetail.value} value={typeDetail.value}>
                                  {typeDetail.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="hidden">
                        <Label>Thành viên ID</Label>
                        <Input
                          className="w-full"
                          placeholder="ID"
                          value={humanDetail.memberID}
                          onChange={(e) => handleChange(index, 'memberID', e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-y-2 sm:col-span-2 lg:col-span-2">
                        <Label>Tiêu đề</Label>
                        <Input
                          className="w-full"
                          placeholder="Nhập tiêu đề"
                          value={humanDetail.title}
                          onChange={(e) => handleChange(index, 'title', e.target.value)}
                        />
                        {errors.memberDetails?.[index]?.title && (
                          <p className="text-red-500 text-sm">{errors.memberDetails[index].title.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-y-2 sm:col-span-2 lg:col-span-2">
                        <Label>Tổ chức</Label>
                        <Input
                          className="w-full"
                          placeholder="Nhập tổ chức"
                          value={humanDetail.place}
                          onChange={(e) => handleChange(index, 'place', e.target.value)}
                        />
                        {errors.memberDetails?.[index]?.place && (
                          <p className="text-red-500 text-sm">{errors.memberDetails[index].place.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-y-2 sm:col-span-2 lg:col-span-2">
                        <Label>Mô tả</Label>
                        <Input
                          className="w-full"
                          placeholder="Nhập mô tả"
                          value={humanDetail.description}
                          onChange={(e) => handleChange(index, 'description', e.target.value)}
                        />
                        {errors.memberDetails?.[index]?.description && (
                          <p className="text-red-500 text-sm">{errors.memberDetails[index].description.message}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={'destructive'}
                      className="absolute right-[-10px] top-2 w-6 h-7 rounded-full"
                      onClick={() => deleteHumanDetailItem(index)}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant={'outline'}
              onClick={addHumanDetail}
              className="my-4 flex items-center ring-1 ring-primary text-primary gap-2 hover:text-primary rounded-full"
            >
              <Plus />
              Thêm sự kiện
            </Button>
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="button" onClick={onSubmitForUpdate}>
              Lưu thông tin
            </Button>
            {/* <SubmitButton text="Lưu thông tin" variant="default" isPending={isPending} /> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default withAuth(MemberDetaiPage);
