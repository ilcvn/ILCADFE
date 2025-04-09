import { createReservation, updateReservationById } from '@/app/api/reservation';
import { RESERVATION_STATUS_OPTIONS, RESERVATION_TYPE_OPTIONS } from '@/app/constants/reservationOptions';
import type Reservation from '@/app/models/features/reservation';
import { reservationFormSchema, type ReservationFormData } from '@/app/schemas/reservation-schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UploadDropzone } from '@/lib/uploadthing';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { SubmitButton } from '../dashboard/SubmitButton';
import { CalendarIcon, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { formatDate } from '@/app/utils/formatDateUTC';
import { addDays, format, isBefore } from 'date-fns';
import { deletefileDataUploadthing } from '@/app/api/deleteImageUT';
import { getArticles } from '@/app/api/article';
import type Article from '@/app/models/features/arcicle';
import { LANGUAGE_OPTIONS } from '@/app/constants/languageOptions';
import { Checkbox } from '@/components/ui/checkbox';

let ALL_SERVICES: Article[];

export default function ReservationForm({
  mode,
  reservation,
  isDialogOpen,
  setIsDialogOpen,
  reloadData,
}: { reservation: Reservation } & {
  mode: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  reloadData: () => void;
}) {
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [nameFileLabel, setNameFileLabel] = useState('');

  const [consultDate, setConsultDate] = useState<Date>(addDays(new Date(), 1));

  const [articles, setArticles] = useState<Article[]>([]);

  const [isUploading, setIsUploading] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleCheckboxChange = (articleId: number) => {
    setSelectedItems((prev) => (prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]));
  };

  useEffect(() => {
    const fetchReservation = async () => {
      setIsLoading(true);
      try {
        const data = await getArticles(1, 100000, 0, {
          type: 'SERVICE',
        });

        if (data) {
          ALL_SERVICES = data?.articles;
          setArticles(data?.articles.filter((article) => article.language === 'VI'));
        }
      } catch (error) {
        console.error('Error fetching human resource:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, []);

  useEffect(() => {
    if (selectedItems.length > 0) {
      const convertDatas = selectedItems.join(', ');
      setValue('subject', convertDatas);
    }
  }, [selectedItems]);

  const {
    register,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      fullName: '',
      address: '',
      consultDate: '',
      content: '',
      file: '',
      gmail: '',
      phone: '',
      status: '',
      subject: '',
      language: '',
    },
  });

  const [state, submitAction, isPending] = useActionState(async (prevState: any, formData: ReservationFormData) => {
    try {
      if (mode === 'CREATE') {
        const request = await createReservation(formData);
        if (request) {
          toast.success('Tạo lịch tư vấn thành công!');
          reset({
            fullName: '',
            address: '',
            consultDate: '',
            content: '',
            file: '',
            gmail: '',
            phone: '',
            status: '',
            subject: '',
            language: '',
          });
          setIsDialogOpen(false);
          setCurrentFileUrl('');
          setConsultDate(new Date());
          reloadData?.();
        } else {
          toast.error('Tạo lịch tư vấn thất bại!');
        }
      } else {
        const request = await updateReservationById(formData, reservation?.id);
        if (request) {
          toast.success('Cập nhật lịch tư vấn thành công!');
          reset({
            fullName: '',
            address: '',
            consultDate: '',
            content: '',
            file: '',
            gmail: '',
            phone: '',
            status: '',
            subject: '',
            language: '',
          });
          setIsDialogOpen(false);
          reloadData?.();
        } else {
          toast.error('Cập nhật lịch tư vấn thất bại!');
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Mất kết nối với máy chủ, vui lòng đợi phản hồi');
    }
  }, undefined);

  useEffect(() => {
    if (mode === 'UPDATE' && reservation) {
      setCurrentFileUrl(reservation?.file);
      reset(reservation);

      if (reservation?.subject) {
        const selectedArray = reservation.subject.split(',').map((item) => Number(item.trim()));
        setSelectedItems(selectedArray);
      }
    } else {
      setSelectedItems([]);
      setCurrentFileUrl('');
      reset({
        fullName: '',
        address: '',
        consultDate: '',
        content: '',
        file: '',
        gmail: '',
        phone: '',
        status: '',
        subject: '',
      });
      setValue('status', RESERVATION_STATUS_OPTIONS[0].value);
      setValue('language', LANGUAGE_OPTIONS[0].value);
    }

    if (consultDate) {
      setValue('consultDate', formatDate(consultDate));
    }
  }, [mode, reservation, reset, consultDate]);

  const onSubmit = (data: ReservationFormData) => {
    startTransition(() => {
      submitAction(data);
    });
  };

  const handleConsultDateChange = (date: Date | undefined) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (isBefore(selectedDate, today)) {
      toast.warning('Ngày tư vấn phải từ hôm nay trở đi!');
      setConsultDate(today);
      setValue('consultDate', formatDate(today));
      return;
    }

    setConsultDate(date);
    setValue('consultDate', formatDate(date));
  };

  const handleDeleteFile = async (imageUrl: string) => {
    try {
      const request = await deletefileDataUploadthing(imageUrl);
      setCurrentFileUrl('');
      setValue('file', '');
      toast.success(request);
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <Dialog open={isDialogOpen}>
      <DialogContent className="max-w-full max-h-[700px] md:max-w-[725px] md:max-h-[500px] lg:max-w-[925px] lg:max-h-[800px] overflow-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {mode === 'CREATE' ? 'Tạo lịch tư vấn - liên hệ' : 'Thông tin tư vấn - liên hệ'}
          </DialogTitle>
          <DialogDescription>{mode === 'CREATE' ? 'Điền thông tin cơ bản để tạo lịch' : 'Tiếp nhận thông tin'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4">
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-1">
              <Label>Ngày tư vấn</Label>
              {mode === 'CREATE' ? (
                <DatePicker
                  onDateChange={handleConsultDateChange}
                  startYear={new Date().getFullYear()}
                  dateValue={consultDate as Date}
                  endYear={new Date().getFullYear()}
                />
              ) : (
                <div className="flex items-center font-bold text-orange-500">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span className="">{reservation?.consultDate && format(reservation?.consultDate, 'dd-MM-yyyy')}</span>
                </div>
              )}
              {errors.consultDate && <p className="text-red-500 text-sm">{errors.consultDate.message}</p>}
            </div>

            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-1">
              <Label className="">Ngôn ngữ</Label>
              <Select
                defaultValue={reservation?.language || LANGUAGE_OPTIONS[0].value}
                onValueChange={(value) => {
                  setArticles(ALL_SERVICES?.filter((article) => article.language === value));
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

            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-3"></div>

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
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>

            {/* createDate */}
            {mode === 'UPDATE' ? (
              <>
                <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-3">
                  <Label>Địa chỉ</Label>
                  <Input id="address" placeholder="Địa chỉ thường trú" {...register('address')} />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>
                <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-1">
                  <Label>Ngày tạo</Label>
                  <Input
                    readOnly
                    id="createDate"
                    value={reservation?.createdDate ? format(new Date(reservation.createdDate), 'dd-MM-yyyy') : ''}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-4">
                <Label>Địa chỉ</Label>
                <Input id="address" placeholder="Địa chỉ thường trú" {...register('address')} />
                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-3">
              <Label>Email</Label>
              <Input id="gmail" placeholder="nguyenvana@gmail.com" {...register('gmail')} />
              {errors.gmail && <p className="text-red-500 text-sm">{errors.gmail.message}</p>}
            </div>

            {/* status */}
            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-1">
              <Label className="text-primary font-bold">Trạng thái tiếp nhận</Label>
              <Select
                defaultValue={reservation?.status || RESERVATION_STATUS_OPTIONS[0].value}
                onValueChange={(value) => {
                  setValue('status', value);
                  trigger('status');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái tư vấn" />
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
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>

            <div className="flex flex-col gap-y-2 col-span-4 lg:col-span-4">
              <Label>Vấn đề:</Label>
              {articles.map((article) => (
                <div key={article.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={article.id}
                    checked={selectedItems.includes(Number(article.id))}
                    onCheckedChange={() => handleCheckboxChange(Number(article.id))}
                  />
                  <label htmlFor="article.value" className="text-sm font-medium">
                    {article.title}
                  </label>
                </div>
              ))}
              {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
            </div>

            {/* Mo Ta */}
            <div className="flex flex-col gap-y-2 col-span-4">
              <Label>Nội dung</Label>
              <Textarea id="content" placeholder="Nhập nội dung.." {...register('content')} className="min-h-[120px]" />
              {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col gap-y-2 relative mt-4">
            <Label className="mb-2">Tải tệp đính kèm</Label>
            <Input
              id="imgPath"
              {...register('file')}
              value={currentFileUrl || ''}
              onChange={(e) => setValue('file', e.target.value)}
              className="sr-only"
            />
            {currentFileUrl ? (
              <div className="relative w-max">
                <div className="flex items-center gap-2">
                  <a href={currentFileUrl} download className="flex items-center gap-2 text-blue-600 hover:underline">
                    <Download className="h-4 w-4" />
                    {nameFileLabel || 'Tải File đính kèm'}{' '}
                  </a>
                  <Button
                    onClick={() => handleDeleteFile(currentFileUrl)}
                    variant="destructive"
                    className="w-2 h-7 -top-3 -right-2 rounded-full"
                    type="button"
                  >
                    <X className="w-4 h-4"></X>
                  </Button>
                </div>
              </div>
            ) : (
              <UploadDropzone
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={(res) => {
                  const url = res[0].url;
                  const name = res[0].name;
                  setNameFileLabel(name);
                  setCurrentFileUrl(url);
                  setValue('file', url); // Cập nhật vào form
                  setIsUploading(false);
                  toast.success('File của bạn đã được upload');
                }}
                onUploadError={(error) => {
                  toast.error(error.message);
                }}
                endpoint="fileUploader"
              />
            )}
            {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
          </div>

          <DialogFooter className="mt-4">
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant={'outline'}
                onClick={() => {
                  reset({
                    fullName: '',
                    address: '',
                    consultDate: '',
                    content: '',
                    file: '',
                    gmail: '',
                    phone: '',
                    status: '',
                    subject: '',
                    language: '',
                  });
                  setSelectedItems([]);

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
