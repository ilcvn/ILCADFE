import { z } from 'zod';

export const humanResourceDetailFormSchema = z.object({
  memberDetails: z.array(
    z.object({
      memberID: z.string().min(1, 'ID thành viên là bắt buộc'),
      typeDetail: z.string().optional(),
      title: z.string().min(1, 'Tiêu đề là bắt buộc'),
      description: z.string().min(1, 'Mô tả là bắt buộc'),
      place: z.string().min(1, 'Tổ chức là bắt buộc'),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    }),
  ),
});

export type humanResourceDetailFormData = z.infer<typeof humanResourceDetailFormSchema>;
