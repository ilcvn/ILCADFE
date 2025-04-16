import { useState } from 'react';
import { toast } from 'sonner';

type Options = {
  successMessage?: string;
  errorMessage?: string;
};

export function useActionWithLoading() {
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const execute = async (action: () => Promise<void>, options?: Options) => {
    setIsLoadingAction(true);

    try {
      await action();
      toast.success(options?.successMessage || 'Thành công');
    } catch (error) {
      toast.error(options?.errorMessage || 'Đã xảy ra lỗi');
    } finally {
      setIsLoadingAction(false);
    }
  };

  return { isLoadingAction, execute };
}
