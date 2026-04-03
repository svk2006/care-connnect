"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!profile) {
      router.push("/login");
      return;
    }

    // Redirect based on role
    const roleRoutes: Record<string, string> = {
      patient: "/dashboard/patient",
      receptionist: "/dashboard/receptionist",
      hospital_admin: "/dashboard/hospital",
      operator: "/dashboard/operator",
      government_admin: "/dashboard/government",
      master: "/dashboard/master",
      db_admin: "/dashboard/db-admin",
    };

    const route = roleRoutes[profile.role];
    if (route) {
      router.push(route);
    }
  }, [user, profile, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
