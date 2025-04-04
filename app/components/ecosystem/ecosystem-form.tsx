import { createEcosystem, updateEcosystemById } from '@/app/api/ecosystem';
import type { Ecosystem } from '@/app/models/features/ecosystem';
import { ecosystemFormSchema, type EcosystemFormData } from '@/app/schemas/ecosystem-schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { SubmitButton } from '../dashboard/SubmitButton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';
import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { ECOSYSTEM_OPTIONS } from '@/app/constants/ecosystemOption';

export default function EcosystemForm({
  mode,
  humanResource: ecosystem,
  isDialogOpen,
  setIsDialogOpen,
  reloadData,
}: { humanResource: Ecosystem } & {
  mode: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  reloadData: () => void;
}) {
  const [currentEcosystemImage, setCurrentEcoSystemImage] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EcosystemFormData>({
    resolver: zodResolver(ecosystemFormSchema),
    defaultValues: { fullName: '', linkWebsite: '', imgUrl: '', typeEcosystem: '' },
  });

  const [state, submitAction, isPending] = useActionState(async (prevState: any, formData: EcosystemFormData) => {
    try {
      if (mode === 'CREATE') {
        const request = await createEcosystem(formData);
        if (request) {
          toast.success('Tạo hệ sinh thái thành công!');
          reset({ fullName: '', linkWebsite: '', imgUrl: '', typeEcosystem: '' });
          setIsDialogOpen(false);
          reloadData?.();
        } else {
          toast.error('Tạo nhân sự thất bại!');
        }
      } else {
        const request = await updateEcosystemById(formData, ecosystem?.id);
        if (request) {
          toast.success('Cập nhật hệ sinh thái thành công!');
          reset({ fullName: '', linkWebsite: '', imgUrl: '', typeEcosystem: '' });
          setIsDialogOpen(false);
          reloadData?.();
        } else {
          toast.error('Cập nhật hệ sinh thái thất bại!');
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    }
  }, undefined);

  const onSubmit = (data: EcosystemFormData) => {
    startTransition(() => {
      submitAction(data);
    });
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const request = await deletefileDataUploadthing(imageUrl);
      setCurrentEcoSystemImage('');
      setValue('imgUrl', '');
      toast.success(request);
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (mode === 'UPDATE' && ecosystem) {
      setCurrentEcoSystemImage(ecosystem?.imgUrl);
      reset(ecosystem);
    } else {
      setCurrentEcoSystemImage('');
      reset({ fullName: '', linkWebsite: '', imgUrl: '' });
      setValue('typeEcosystem', ECOSYSTEM_OPTIONS[0].value);
    }
  }, [mode, ecosystem, reset]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-full max-h-[600px] md:max-w-[625px] md:max-h-[500px] lg:max-w-[825px] lg:max-h-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">{mode === 'CREATE' ? 'Tạo hệ sinh thái' : 'Cập nhật thông tin'}</DialogTitle>
          <DialogDescription>
            {mode === 'CREATE' ? 'Điền các thông tin của hệ sinh thái' : 'Cập nhật các thông tin của hệ sinh thái'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4">
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-2">
              <Label>Tên tiếng việt</Label>
              <Input id="fullName" placeholder="Nhập tên hệ sinh thái đầy đủ" {...register('fullName')} />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>

            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-2">
              <Label>Thể loại đối tác</Label>
              <Select
                defaultValue={ecosystem?.typeEcosystem || ECOSYSTEM_OPTIONS[0].value}
                onValueChange={(value) => {
                  setValue('typeEcosystem', value);
                  trigger('typeEcosystem');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ECOSYSTEM_OPTIONS.map((typeEcosystem) => (
                      <SelectItem key={typeEcosystem.value} value={typeEcosystem.value}>
                        {typeEcosystem.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {errors.typeEcosystem && <p className="text-red-500 text-sm">{errors.typeEcosystem.message}</p>}
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-4">
              <Label>Đường truy cập tổ chức</Label>
              <Input
                id="linkWebsite"
                placeholder="Nhập đường truy cập tổ chức"
                {...register('linkWebsite')}
                className="text-blue-600"
              />
              {errors.linkWebsite && <p className="text-red-500 text-sm">{errors.linkWebsite.message}</p>}
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col gap-y-4 relative mt-4">
            <Label>Hình ảnh hệ sinh thái</Label>
            <Input
              id="imgPath"
              {...register('imgUrl')}
              value={currentEcosystemImage}
              onChange={(e) => setValue('imgUrl', e.target.value)}
              className="sr-only"
            />
            {currentEcosystemImage ? (
              <div className="relative w-36 h-36">
                <Image
                  src={currentEcosystemImage}
                  alt="profileImage"
                  className="object-cover rounded-md w-full h-full"
                  width={150}
                  height={150}
                />
                <Button
                  onClick={() => handleDeleteImage(currentEcosystemImage)}
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
                  const url = res[0].url;
                  setCurrentEcoSystemImage(url);
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
              <Button type="button" variant={'outline'} onClick={() => setIsDialogOpen(false)}>
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
