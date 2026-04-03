"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayout } from "@/components/Sidebar";
import { Request } from "@/lib/database";
import { fetchUserRequests } from "@/lib/database";

export default function PatientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { requests: allRequests, loading } = useRealtimeRequests();
  const [userRequests, setUserRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (user && allRequests.length > 0) {
      const filtered = allRequests.filter((r) => r.created_by === user.id);
      setUserRequests(filtered);
    }
  }, [user, allRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 font-semibold";
      case "medium":
        return "text-yellow-600 font-semibold";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout title="My Requests">
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Requests">
      <div className="grid gap-6">
        {userRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <p>You have no requests yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Request ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Severity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned Hospital</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {userRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{req.id.substring(0, 8)}...</td>
                    <td className={`px-6 py-4 text-sm ${getSeverityColor(req.severity)}`}>{req.severity.toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{req.assigned_hospital || "Not assigned"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(req.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
