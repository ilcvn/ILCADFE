import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3"
          >
            <Loader2 className="animate-spin h-5 w-5 text-primary" />
            <span className="text-gray-800 text-sm">Đang xử lý...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
