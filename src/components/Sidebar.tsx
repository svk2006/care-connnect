"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  title: string;
}

export function Sidebar({ title }: SidebarProps) {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const navItems = [
    { label: "Patient", href: "/dashboard/patient", roles: ["patient"] },
    { label: "Receptionist", href: "/dashboard/receptionist", roles: ["receptionist"] },
    { label: "Hospital Admin", href: "/dashboard/hospital", roles: ["hospital_admin"] },
    { label: "Operator", href: "/dashboard/operator", roles: ["operator"] },
    { label: "Government", href: "/dashboard/government", roles: ["government_admin"] },
    { label: "Master", href: "/dashboard/master", roles: ["master"] },
    { label: "DB Admin", href: "/dashboard/db-admin", roles: ["db_admin"] },
  ];

  const allowedItems = navItems.filter((item) => profile && item.roles.includes(profile.role));

  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">CareConnect</h1>

      <nav className="space-y-2 mb-8">
        {allowedItems.map((item) => (
          <Link key={item.href} href={item.href} className="block px-4 py-2 rounded hover:bg-blue-700 transition">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        {profile && (
          <div className="mb-4 p-3 bg-blue-700 rounded text-sm">
            <p className="font-semibold">{profile.full_name}</p>
            <p className="text-blue-100 text-xs">{profile.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex">
      <Sidebar title={title} />
      <div className="flex-1 bg-gray-50 min-h-screen p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">{title}</h2>
        {children}
      </div>
    </div>
  );
}
