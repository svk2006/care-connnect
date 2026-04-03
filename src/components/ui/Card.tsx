"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface CardProps {
  title?: string;
  value?: string | number;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700",
  gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white",
  success: "bg-gradient-to-br from-green-500 to-green-600 text-white",
  warning: "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white",
  danger: "bg-gradient-to-br from-red-500 to-red-600 text-white",
  info: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
};

export function Card({
  title,
  value,
  icon: Icon,
  children,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && (
            <p className={`text-sm font-medium ${variant === "default" ? "text-gray-600 dark:text-gray-400" : "opacity-90"}`}>
              {title}
            </p>
          )}
          {value !== undefined && (
            <p className={`text-4xl font-bold ${title ? "mt-2" : ""} ${variant === "default" ? "text-gray-900 dark:text-white" : ""}`}>
              {value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${variant === "default" ? "bg-gray-100 dark:bg-slate-700" : "bg-white/20"}`}>
            <Icon size={24} className={variant === "default" ? "text-cyan-600 dark:text-cyan-400" : "text-white"} />
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
