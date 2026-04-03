"use client";

import { useState } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayoutNew({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Navbar */}
      <Navbar onMenuToggle={toggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <ModernSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 pt-4 px-4 md:px-8 pb-8 lg:pt-6">
          {title && (
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to MediFlow AI</p>
            </div>
          )}

          {/* Content Container with rounded cards */}
          <div className="max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
