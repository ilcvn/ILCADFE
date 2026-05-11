'use client';

import { X } from 'lucide-react';

interface Props {
  setIsShowFormat: (value: boolean) => void;
}

const IntroductionArticle = ({ setIsShowFormat }: Props) => {
  // const [isShowFormat, setIsShowFormat] = useState<Boolean>(false);

  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-zinc-800 sticky top-4 w-full lg:w-72 shrink-0 self-start">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-primary">Bố cục mẫu</h2>
        <button
          type="button"
          onClick={() => setIsShowFormat(false)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
        >
          <X size={14} />
        </button>
      </div>
      <hr className="mb-3 border-gray-200" />
      <article className="text-sm space-y-2">
        <h1 className="text-base font-bold">Tiêu đề bài viết</h1>
        <p className="italic text-gray-500 text-xs">Giới thiệu ngắn gọn về nội dung bài viết.</p>
        <h2 className="text-sm font-bold mt-2">Mục 1: Giới thiệu</h2>
        <p className="text-xs text-gray-600">Đây là phần giới thiệu về bài viết.</p>
        <h2 className="text-sm font-bold mt-2">Mục 2: Nội dung chính</h2>
        <p className="text-xs text-gray-600">Chi tiết nội dung bài viết.</p>
        <img src="https://placehold.co/400x200/6A00F5/white?text=Hình+minh+họa" alt="Hình minh họa" className="rounded w-full" />
        <p className="text-xs text-gray-400">Chú thích ảnh.</p>
        <h2 className="text-sm font-bold mt-2">Mục 3: Kết luận</h2>
        <p className="text-xs text-gray-600">Tóm tắt nội dung chính.</p>
      </article>
    </div>
  );
};

export default IntroductionArticle;
