import { z } from 'zod';

// Schema mới phù hợp với dữ liệu được yêu cầu
export const reservationFormSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  status: z.string().min(1, 'Trạng thái là bắt buộc'),
  consultDate: z.string().date('Ngày tư vấn là bắt buộc'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự').optional(),
  gmail: z.string().email('Email không hợp lệ').optional(),
  address: z.string().optional(),
  subject: z.string().optional(),
  file: z.string().optional(),
  language: z.string().min(1, 'Ngôn ngữ là bắt buộc'),
});

// Kiểu dữ liệu từ schema
export type ReservationFormData = z.infer<typeof reservationFormSchema>;
