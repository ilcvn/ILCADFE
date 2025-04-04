import axios from 'axios';

export const deletefileDataUploadthing = async (fileUrl: string) => {
  try {
    const response = await axios.delete('/api/uploadthing', {
      data: { url: fileUrl },
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.data.status === 200) {
      return 'File hoặc dữ liệu hình ảnh đã được xóa';
    } else {
      return 'Xóa thất bại';
    }
  } catch (error: any) {
    const errorMessage = error?.response.message;
    throw new Error(errorMessage);
  }
};
