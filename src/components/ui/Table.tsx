"use client";

import { ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function Table({ headers, children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 ${className}`}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = "", onClick }: TableRowProps) {
  return (
    <tr
      className={`bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td className={`px-6 py-4 text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </td>
  );
}

export function EmptyTableState({ message = "No data available" }: { message?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-8">
      <p className="text-center text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
