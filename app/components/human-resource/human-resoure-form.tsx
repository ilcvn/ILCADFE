'use client';

import { SubmitButton } from '@/app/components/dashboard/SubmitButton';
import type HumanResource from '@/app/models/features/human-resource';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadDropzone } from '@/lib/uploadthing';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { humanResourceFormSchema, type humanResourceFormData } from '@/app/schemas/human-resource-schema';
import { createHumanResource, getImageUrl, updateHumanResourceById } from '@/app/api/human-resource';
import { Textarea } from '@/components/ui/textarea';
import {
  HUMAN_RESOURCE_OPTIONS,
  HUMAN_RESOURCE_PEN_NAME_OPTIONS,
  HUMAN_RESOURCE_DEPARTMENT_OPTIONS,
} from '@/app/constants/humanResourceOption';
import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { LANGUAGE_OPTIONS } from '@/app/constants/languageOptions';

export default function HumanResourceForm({
  mode,
  humanResource,
  isDialogOpen,
  setIsDialogOpen,
  reloadData,
}: { humanResource: HumanResource } & {
  mode: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  reloadData: () => void;
}) {
  const [currentProfileImage, setCurrentProfileImage] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  const [departmentRolesPenNameListAdd, setDepartmentRolesPenNameListAdd] = useState([
    {
      department: HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value,
      role: HUMAN_RESOURCE_OPTIONS[0].value,
      //penName: HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value,
    },
  ]);

  const {
    register,
    setValue,
    trigger,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<humanResourceFormData>({
    resolver: zodResolver(humanResourceFormSchema),
    defaultValues: {
      fullName: '',
      gmail: '',
      penName: '',
      imgUrl: '',
      phone: '',
      description: '',
      language: '',
      departmentRolePenNames: [
        {
          department: HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value,
          role: HUMAN_RESOURCE_OPTIONS[0].value,
          //penName: HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value,
        },
      ],
    },
  });

  const addDepartmentRole = () => {
    setDepartmentRolesPenNameListAdd([
      ...departmentRolesPenNameListAdd,
      {
        department: HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value,
        role: HUMAN_RESOURCE_OPTIONS[0].value,
        //penName: HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value,
      },
    ]);
  };

  const removeDepartmentRole = (index: number) => {
    const updatedList = departmentRolesPenNameListAdd.filter((_, i) => i !== index);
    setDepartmentRolesPenNameListAdd(updatedList);
  };

  const [state, submitAction, isPending] = useActionState(async (prevState: any, formData: humanResourceFormData) => {
    try {
      //Kiểm tra ràng buộc giá trị ban đầu đều được chọn
      let de = false;
      let ro = false;

      formData.departmentRolePenNames.forEach((item) => {
        if (item.department !== 'NA') de = true;
        //if (item.penName !== 'NA') pen = true;
        if (item.role !== 'NA') ro = true;
      });

      //Điều kiện dừng cho mỗi giá trị
      if (de === false) {
        toast.error('Phải chọn ít nhất một phòng ban');
        return;
      }

      if (ro === false) {
        toast.error('Phải chọn ít chức vụ');
        return;
      }

      if (formData.department?.split(', ').length !== formData.role?.split(', ').length) {
        toast.error('Số lượng phòng ban và vai trò phải bằng nhau');
        return;
      }

      if (mode === 'CREATE') {
        const request = await createHumanResource(formData);
        if (request) {
          toast.success('Tạo nhân sự thành công!');
          reset({
            fullName: '',
            gmail: '',
            penName: '',
            imgUrl: '',
            phone: '',
            description: '',
            language: '',
            department: '',
            role: '',
            departmentRolePenNames: [{ department: '', role: '' /*penName: ''*/ }],
          });

          setIsDialogOpen(false);
          reloadData?.();

          setDepartmentRolesPenNameListAdd([
            {
              department: HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value,
              role: HUMAN_RESOURCE_OPTIONS[0].value,
              //penName: HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value,
            },
          ]);

          setCurrentProfileImage('');
          setValue('language', LANGUAGE_OPTIONS[0].value);
        } else {
          toast.error('Tạo nhân sự thất bại!');
        }
      } else {
        const request = await updateHumanResourceById(formData, humanResource?.id);
        if (request) {
          toast.success('Cập nhật nhân sự thành công!');
          reset({
            fullName: '',
            gmail: '',
            penName: '',
            imgUrl: '',
            phone: '',
            description: '',
            language: '',
            department: '',
            role: '',
            departmentRolePenNames: [{ department: '', role: '' /*penName: ''*/ }],
          });
          setIsDialogOpen(false);
          reloadData?.();
        } else {
          toast.error('Cập nhật nhân sự thất bại!');
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    }
  }, undefined);

  const onSubmit = (data: humanResourceFormData) => {
    if (!data.department || !data.role /*|| !data.penName*/) {
      data.department = HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value;
      data.role = HUMAN_RESOURCE_OPTIONS[0].value;
      //data.penName = HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value;
    }
    startTransition(() => {
      submitAction(data);
    });
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const request = await deletefileDataUploadthing(imageUrl);

      if (imageUrl) {
        const countImageUrl = await getImageUrl(imageUrl);
        if (countImageUrl === 0) {
          await deletefileDataUploadthing(imageUrl);
        }
      }
      setCurrentProfileImage('');
      setValue('imgUrl', '');
      toast.success(request);
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (mode === 'UPDATE' && humanResource) {
      setCurrentProfileImage(humanResource?.imgUrl);
      reset(humanResource);

      const departments = humanResource.department.split(',').map((penName) => penName.trim()) || [];
      const roles = humanResource.role.split(',').map((penName) => penName.trim()) || [];
      //const penNames = humanResource.penName.split(',').map((penName) => penName.trim()) || [];

      setDepartmentRolesPenNameListAdd(
        Array.from({ length: Math.max(departments.length, roles.length /*penNames.length*/) }, (_, index) => ({
          department: departments[index] || HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value,
          role: roles[index] || HUMAN_RESOURCE_OPTIONS[0].value,
          //penName: penNames[index] || HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value,
        })),
      );
    } else {
      setCurrentProfileImage('');
      setDepartmentRolesPenNameListAdd([
        {
          department: HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value,
          role: HUMAN_RESOURCE_OPTIONS[0].value,
          //penName: HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value,
        },
      ]);

      reset({
        fullName: '',
        gmail: '',
        imgUrl: '',
        phone: '',
        description: '',
        department: '',
        penName: '',
        role: '',
        language: '',
        departmentRolePenNames: [{ department: '', role: '' /*penName: '' */ }],
      });

      setValue('language', LANGUAGE_OPTIONS[0].value);
    }
  }, [mode, humanResource, reset]);

  useEffect(() => {
    setValue('departmentRolePenNames', departmentRolesPenNameListAdd);

    const updateDepartRolePenNameValues = () => {
      let departmentRolePenNames = getValues('departmentRolePenNames');

      // DEPARTMENT
      let departments = '';
      departmentRolePenNames.forEach((item) => {
        if (item.department !== 'NA') {
          if (departments.length !== 0) {
            departments += ', ';
          }
          departments += item.department;
        }
      });

      // ROLE
      let roles = '';
      departmentRolePenNames.forEach((item) => {
        if (item.role !== 'NA') {
          if (roles.length !== 0) {
            roles += ', ';
          }
          roles += item.role;
        }
      });

      // PENNAME
      /*let penNames = '';
      departmentRolePenNames.forEach((item) => {
        if (item.penName !== 'NA') {
          if (penNames.length !== 0) {
            penNames += ', ';
          }
          penNames += item.penName;
        }
      });*/

      setValue('department', departments);
      setValue('role', roles);
      //setValue('penName', penNames);
    };

    updateDepartRolePenNameValues();
  }, [departmentRolesPenNameListAdd, setValue]);

  const handleChange = (index: number, field: keyof humanResourceFormData['departmentRolePenNames'][number], value: string) => {
    setDepartmentRolesPenNameListAdd((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <Dialog open={isDialogOpen}>
      <DialogContent className="max-w-[400px] max-h-[600px] md:max-w-[625px] md:max-h-[500px] lg:max-w-[825px] lg:max-h-[800px] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-primary">{mode === 'CREATE' ? 'Tạo nhân sự' : 'Cập nhật thông tin'}</DialogTitle>
          <DialogDescription>
            {mode === 'CREATE' ? 'Điền các thông tin của nhân sự' : 'Cập nhật các thông tin của nhân sự'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-2">
              <Label>Họ tên</Label>
              <Input id="fullName" placeholder="Nhập họ tên đầy đủ" {...register('fullName')} />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-2">
              <Label>Số điện thoại</Label>
              <Input id="phone" placeholder="Nhập số điện thoại" {...register('phone')} />
              {/* {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>} */}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-3">
              <Label>Email</Label>
              <Input id="gmail" placeholder="nguyenvana@gmail.com" {...register('gmail')} />
              {/* {errors.gmail && <p className="text-red-500 text-sm">{errors.gmail.message}</p>} */}
            </div>

            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-1">
              <Label className="">Ngôn ngữ</Label>
              <Select
                defaultValue={humanResource?.language || LANGUAGE_OPTIONS[0].value}
                onValueChange={(value) => {
                  setValue('language', value);
                  trigger('language');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái tư vấn" />
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

            {/* PenName */}
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-4">
              <Label>Danh Xưng</Label>
              <Input
                id="penName"
                placeholder="Luật Sư, Tiến Sĩ, Nguyên Thẩm Phán"
                {...register('penName')}
                onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
              />

              {errors.penName && <p className="text-red-500 text-sm">{errors.penName.message}</p>}
            </div>

            {departmentRolesPenNameListAdd.map((departmentRolesPenName, index) => (
              <div
                key={index}
                className="flex flex-col gap-y-2 col-span-4 lg:col-span-4 space-y-2 relative border-b pb-4 border-1 border-primary"
              >
                <div className="absolute w-2 h-2 top-4 -translate-y-1/2 -left-4 bg-primary rounded-full"></div>
                <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-2">
                  <Label>Văn phòng, Ban</Label>
                  <Select
                    defaultValue={departmentRolesPenName?.department || HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value}
                    onValueChange={(value) => handleChange(index, 'department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {HUMAN_RESOURCE_DEPARTMENT_OPTIONS.map((department) => (
                          <SelectItem key={department.value} value={department.value}>
                            {department.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-2">
                  <Label>Vai trò</Label>
                  <Select
                    defaultValue={departmentRolesPenName?.role || HUMAN_RESOURCE_OPTIONS[0].value}
                    onValueChange={(value) => handleChange(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
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
                </div>

                {/* PenName */}
                {/* <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-">
                  <Label>Danh xưng</Label>
                  <Select
                    defaultValue={departmentRolesPenName?.penName || HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value}
                    onValueChange={(value) => handleChange(index, 'penName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh xưng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {HUMAN_RESOURCE_PEN_NAME_OPTIONS.map((penName) => (
                          <SelectItem key={penName.value} value={penName.value}>
                            {penName.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div> */}

                {index !== 0 && (
                  <Button className="" variant={'destructive'} onClick={() => removeDepartmentRole(index)}>
                    Xóa
                  </Button>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-4 ml-auto">
              <Button
                onClick={addDepartmentRole}
                type="button"
                variant="outline"
                className="w-20 ring-1 ring-primary text-primary gap-2 hover:text-primary rounded-full"
              >
                <Plus />
              </Button>
            </div>

            {/* Mo Ta */}
            <div className="flex flex-col gap-y-2 col-span-4">
              <Label>Mô Tả</Label>
              <Textarea id="description" placeholder="Nhập nội dung.." {...register('description')} className="min-h-[300px]" />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col gap-y-2 relative mt-4">
            <Label>Hình ảnh cá nhân</Label>
            <Input
              id="imgPath"
              {...register('imgUrl')}
              value={currentProfileImage}
              onChange={(e) => setValue('imgUrl', e.target.value)}
              className="sr-only"
            />
            {currentProfileImage ? (
              <div className="relative w-36 h-36">
                <Image
                  src={currentProfileImage}
                  alt="profileImage"
                  className="object-cover rounded-md w-full h-full"
                  width={150}
                  height={150}
                />
                <Button
                  onClick={() => handleDeleteImage(currentProfileImage)}
                  variant="destructive"
                  className="absolute w-4 h-7 -top-3 -right-3 rounded-full"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <UploadDropzone
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={(res) => {
                  const url = res[0].ufsUrl;
                  setCurrentProfileImage(url);
                  setValue('imgUrl', url); // Cập nhật vào form
                  setIsUploading(false);
                  toast.success('Hình ảnh của bạn đã được upload');
                }}
                onUploadError={(error) => {
                  toast.error(error.message);
                }}
                endpoint="singleImageUploader"
              />
            )}
            {errors.imgUrl && <p className="text-red-500 text-sm">{errors.imgUrl.message}</p>}
          </div>

          <DialogFooter className="mt-4">
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant={'outline'}
                onClick={() => {
                  reset();
                  setValue('language', LANGUAGE_OPTIONS[0].value);
                  setDepartmentRolesPenNameListAdd([
                    {
                      department: HUMAN_RESOURCE_DEPARTMENT_OPTIONS[0].value,
                      role: HUMAN_RESOURCE_OPTIONS[0].value,
                      //penName: HUMAN_RESOURCE_PEN_NAME_OPTIONS[0].value,
                    },
                  ]);
                  setIsDialogOpen(false);
                }}
              >
                Hủy
              </Button>
              <SubmitButton text="Lưu thông tin" variant="default" isPending={isPending || isUploading} />
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
