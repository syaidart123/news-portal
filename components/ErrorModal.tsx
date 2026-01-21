"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onRetry: () => void;
}

export default function ErrorModal({
  isOpen,
  message,
  onClose,
  onRetry,
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-semibold">Terjadi Kesalahan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
          >
            <RefreshCw size={18} />
            Muat Ulang
          </button>
        </div>
      </div>
    </div>
  );
}
