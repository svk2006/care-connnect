"use client";

import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayout } from "@/components/Sidebar";
import { getAnalytics } from "@/lib/loadBalancer";

export default function GovernmentDashboard() {
  const { hospitals, loading: hospitalsLoading } = useRealtimeHospitals();
  const { requests, loading: requestsLoading } = useRealtimeRequests();

  if (hospitalsLoading || requestsLoading) {
    return (
      <DashboardLayout title="Government Analytics">
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  const analytics = getAnalytics(requests, hospitals);

  // Calculate severity distribution percentages
  const totalRequests = analytics.totalRequests || 1;
  const criticalPercent = ((analytics.criticalRequests / totalRequests) * 100).toFixed(1);
  const mediumPercent = ((analytics.mediumRequests / totalRequests) * 100).toFixed(1);
  const lowPercent = ((analytics.lowRequests / totalRequests) * 100).toFixed(1);

  return (
    <DashboardLayout title="Government Analytics">
      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Requests</p>
            <p className="text-4xl font-bold mt-2">{analytics.totalRequests}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Assigned</p>
            <p className="text-4xl font-bold mt-2">{analytics.assignedRequests}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Pending</p>
            <p className="text-4xl font-bold mt-2">{analytics.pendingRequests}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Completed</p>
            <p className="text-4xl font-bold mt-2">{analytics.completedRequests}</p>
          </div>
        </div>

        {/* Request Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Severity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Requests by Severity</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Critical</span>
                  <span className="text-red-600 font-semibold">{analytics.criticalRequests} ({criticalPercent}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${criticalPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Medium</span>
                  <span className="text-yellow-600 font-semibold">
                    {analytics.mediumRequests} ({mediumPercent}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${mediumPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Low</span>
                  <span className="text-green-600 font-semibold">{analytics.lowRequests} ({lowPercent}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${lowPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bed Utilization */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Hospital Resources</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Available Beds</span>
                  <span className="font-semibold text-blue-600">{analytics.totalBedsAvailable}</span>
                </div>
                <div className="text-sm text-gray-600">Across all hospitals</div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Emergency Capacity</span>
                  <span className="font-semibold text-red-600">{analytics.totalEmergencyCapacity}</span>
                </div>
                <div className="text-sm text-gray-600">Total emergency beds</div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Bed Utilization Rate</span>
                  <span className="font-bold text-lg text-purple-600">{analytics.bedUtilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-purple-500 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(parseFloat(analytics.bedUtilization.toString()), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Request Status Distribution</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{analytics.assignedRequests}</p>
              <p className="text-sm text-gray-600 mt-2">Assigned</p>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{analytics.pendingRequests}</p>
              <p className="text-sm text-gray-600 mt-2">Pending</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{analytics.completedRequests}</p>
              <p className="text-sm text-gray-600 mt-2">Completed</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{hospitals.length}</p>
              <p className="text-sm text-gray-600 mt-2">Hospitals</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
