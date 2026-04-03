"use client";

export const dynamic = "force-dynamic";

import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { fetchAllUsers } from "@/lib/database";
import { useEffect, useState } from "react";

export default function DbAdminDashboard() {
  const { hospitals, loading: hospitalsLoading } = useRealtimeHospitals();
  const { requests, loading: requestsLoading } = useRealtimeRequests();
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await fetchAllUsers();
        setUserCount(allUsers.length);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (hospitalsLoading || requestsLoading || loading) {
    return (
      <DashboardLayoutNew title="DB Admin">
        <p>Loading...</p>
      </DashboardLayoutNew>
    );
  }

  // Calculate stats
  const totalBedsCapacity = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
  const totalEmergencyCapacity = hospitals.reduce((sum, h) => sum + h.emergency_capacity, 0);
  const averageBedsPerHospital = hospitals.length > 0 ? (totalBedsCapacity / hospitals.length).toFixed(1) : 0;

  const requestsCreatedToday = requests.filter((r) => {
    const today = new Date().toDateString();
    return new Date(r.created_at).toDateString() === today;
  }).length;

  return (
    <DashboardLayoutNew title="Database Admin - System Stats">
      <div className="grid gap-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Users</p>
            <p className="text-4xl font-bold mt-2">{userCount}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Hospitals</p>
            <p className="text-4xl font-bold mt-2">{hospitals.length}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Requests</p>
            <p className="text-4xl font-bold mt-2">{requests.length}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Today's Requests</p>
            <p className="text-4xl font-bold mt-2">{requestsCreatedToday}</p>
          </div>
        </div>

        {/* Database Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Hospital Resources</h3>

            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Bed Capacity</span>
                <span className="font-bold text-blue-600">{totalBedsCapacity}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Emergency Capacity</span>
                <span className="font-bold text-red-600">{totalEmergencyCapacity}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Avg Beds per Hospital</span>
                <span className="font-bold text-purple-600">{averageBedsPerHospital}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Hospitals</span>
                <span className="font-bold text-green-600">{hospitals.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Request Statistics</h3>

            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Total Requests</span>
                <span className="font-bold text-blue-600">{requests.length}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Pending</span>
                <span className="font-bold text-yellow-600">{requests.filter((r) => r.status === "pending").length}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Assigned</span>
                <span className="font-bold text-green-600">{requests.filter((r) => r.status === "assigned").length}</span>
              </div>

              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Completed</span>
                <span className="font-bold text-purple-600">{requests.filter((r) => r.status === "completed").length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Hospitals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hospitals in System</h3>

            <div className="space-y-2">
              {hospitals.slice(0, 5).map((h) => (
                <div key={h.id} className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">{h.name}</span>
                  <span className="text-sm text-gray-600">{h.available_beds} beds</span>
                </div>
              ))}
            </div>
          </div>

          {/* Request Types */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Severity Distribution</h3>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Critical</span>
                  <span className="text-red-600 font-semibold">
                    {requests.filter((r) => r.severity === "critical").length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${requests.length > 0 ? ((requests.filter((r) => r.severity === "critical").length / requests.length) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Medium</span>
                  <span className="text-yellow-600 font-semibold">
                    {requests.filter((r) => r.severity === "medium").length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${requests.length > 0 ? ((requests.filter((r) => r.severity === "medium").length / requests.length) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">Low</span>
                  <span className="text-green-600 font-semibold">
                    {requests.filter((r) => r.severity === "low").length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${requests.length > 0 ? ((requests.filter((r) => r.severity === "low").length / requests.length) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutNew>
  );
}
