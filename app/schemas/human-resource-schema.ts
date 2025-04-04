import { z } from 'zod';

// Schema cho form human resource
export const humanResourceFormSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  imgUrl: z.string(),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự'),
  gmail: z.string().email('Email không hợp lệ'),
  departmentRolePenNames: z.array(
    z.object({
      department: z.string().optional(),
      penName: z.string().optional(),
      role: z.string().optional(),
    }),
  ),
  department: z.string().optional(),
  penName: z.string().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  language: z.string().min(1, 'Ngôn ngữ là bắt buộc'),
});

// Kiểu dữ liệu từ schema nha
export type humanResourceFormData = z.infer<typeof humanResourceFormSchema>;
