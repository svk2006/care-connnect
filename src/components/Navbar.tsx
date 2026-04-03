"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Menu, LogOut, Moon, Sun } from "lucide-react";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left side - Menu toggle and app name */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-700 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MediFlow AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hospital Load Balancing</p>
            </div>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-700 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Info */}
          {profile && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile.role.replace(/_/g, " ")}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{profile.full_name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition text-red-600 dark:text-red-400"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
