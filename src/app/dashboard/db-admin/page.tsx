"use client";

export const dynamic = "force-dynamic";

import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { fetchAllUsers } from "@/lib/database";
import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui";
import { TrendingUp, Hospital, AlertCircle, Clock } from "lucide-react";

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
          <Card 
            title="Total Users" 
            value={userCount} 
            variant="success"
            icon={TrendingUp}
          />

          <Card 
            title="Total Hospitals" 
            value={hospitals.length} 
            variant="info"
            icon={Hospital}
          />

          <Card 
            title="Total Requests" 
            value={requests.length} 
            variant="warning"
            icon={AlertCircle}
          />

          <Card 
            title="Today's Requests" 
            value={requestsCreatedToday} 
            variant="info"
            icon={Clock}
          />
        </div>

        {/* Database Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Hospital Resources">
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Bed Capacity</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{totalBedsCapacity}</span>
              </div>

              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Emergency Capacity</span>
                <span className="font-bold text-red-600 dark:text-red-400">{totalEmergencyCapacity}</span>
              </div>

              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Avg Beds per Hospital</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{averageBedsPerHospital}</span>
              </div>

              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Hospitals</span>
                <span className="font-bold text-green-600 dark:text-green-400">{hospitals.length}</span>
              </div>
            </div>
          </Card>

          <Card title="Request Statistics">
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Total Requests</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{requests.length}</span>
              </div>

              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Pending</span>
                <Badge variant="warning">{requests.filter((r) => r.status === "pending").length}</Badge>
              </div>

              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Assigned</span>
                <Badge variant="success">{requests.filter((r) => r.status === "assigned").length}</Badge>
              </div>

              <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Completed</span>
                <Badge variant="info">{requests.filter((r) => r.status === "completed").length}</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Hospitals */}
          <Card title="Hospitals in System">
            <div className="space-y-2">
              {hospitals.slice(0, 5).map((h) => (
                <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{h.name}</span>
                  <Badge variant="info">
                    {h.available_beds} beds
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Request Types */}
          <Card title="Request Severity Distribution">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Critical</span>
                  <Badge variant="danger">
                    {requests.filter((r) => r.severity === "critical").length}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${requests.length > 0 ? ((requests.filter((r) => r.severity === "critical").length / requests.length) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Medium</span>
                  <Badge variant="warning">
                    {requests.filter((r) => r.severity === "medium").length}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${requests.length > 0 ? ((requests.filter((r) => r.severity === "medium").length / requests.length) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Low</span>
                  <Badge variant="success">
                    {requests.filter((r) => r.severity === "low").length}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${requests.length > 0 ? ((requests.filter((r) => r.severity === "low").length / requests.length) * 100).toFixed(0) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayoutNew>
  );
}
