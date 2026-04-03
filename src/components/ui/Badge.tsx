"use client";

interface BadgeProps {
  children: string | number | React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200",
  success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export function Badge({ children, variant = "default", size = "md" }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
