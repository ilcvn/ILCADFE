import { z } from 'zod';

export const ecosystemFormSchema = z.object({
  fullName: z.string().min(1, 'Tên là bắt buộc'),
  linkWebsite: z.string().min(1, 'Đường truy cập tổ chức là bắt buộc').url('Đường dẫn không hợp lệ'),
  imgUrl: z.string().optional(),
  typeEcosystem: z.string().min(1, 'Vui lòng chọn vai trò'),
});

export type EcosystemFormData = z.infer<typeof ecosystemFormSchema>;
