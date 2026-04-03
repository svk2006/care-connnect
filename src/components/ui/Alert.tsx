"use client";

import { ReactNode } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-800 dark:text-green-200",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-800 dark:text-red-200",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-800 dark:text-yellow-200",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
  },
};

export function Alert({
  type = "info",
  title,
  message,
  onClose,
  dismissible = true,
}: AlertProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.bg} ${config.border} p-4 flex gap-3`}>
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${config.text}`} />
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${config.text}`}>{title}</h3>}
        <p className={config.text}>{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 hover:opacity-70 transition ${config.text}`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
