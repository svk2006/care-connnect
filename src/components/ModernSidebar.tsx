"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Stethoscope,
  Building2,
  Radio,
  Landmark,
  Settings,
  Database,
  ChevronRight,
  X,
} from "lucide-react";

interface ModernSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: "Patient", href: "/dashboard/patient", roles: ["patient"], icon: Users },
  { label: "Receptionist", href: "/dashboard/receptionist", roles: ["receptionist"], icon: Stethoscope },
  { label: "Hospital Admin", href: "/dashboard/hospital", roles: ["hospital_admin"], icon: Building2 },
  { label: "Operator", href: "/dashboard/operator", roles: ["operator"], icon: Radio },
  { label: "Government", href: "/dashboard/government", roles: ["government_admin"], icon: Landmark },
  { label: "Master", href: "/dashboard/master", roles: ["master"], icon: Settings },
  { label: "DB Admin", href: "/dashboard/db-admin", roles: ["db_admin"], icon: Database },
];

export function ModernSidebar({ isOpen = true, onClose }: ModernSidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const allowedItems = navItems.filter((item) => profile && item.roles.includes(profile.role));

  return (
    <>
      {/* Overlay */}
      {!isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 pt-20 w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-white overflow-y-auto transition-transform duration-300 z-40 lg:relative lg:pt-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <X size={24} />
        </button>

        {/* Logo area */}
        <div className="px-6 py-6 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Navigation</h2>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-6 space-y-2">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium flex-1">{item.label}</span>
                {isActive && <ChevronRight size={18} />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card */}
        {profile && (
          <div className="absolute bottom-6 left-4 right-4 p-4 rounded-xl bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{profile.full_name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{profile.role.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
