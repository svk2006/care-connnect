"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "success", duration = 3000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, type, message, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const isSuccess = toast.type === "success";

  return (
    <div
      className={`rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-right ${
        isSuccess
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      }`}
    >
      {isSuccess ? (
        <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0" />
      )}
      <p
        className={`flex-1 text-sm font-medium ${
          isSuccess
            ? "text-green-800 dark:text-green-200"
            : "text-red-800 dark:text-red-200"
        }`}
      >
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="p-1 hover:opacity-70 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
