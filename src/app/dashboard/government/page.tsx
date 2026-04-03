"use client";

export const dynamic = "force-dynamic";

import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { getAnalytics } from "@/lib/loadBalancer";
import { Card, Badge } from "@/components/ui";
import { TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function GovernmentDashboard() {
  const { hospitals, loading: hospitalsLoading } = useRealtimeHospitals();
  const { requests, loading: requestsLoading } = useRealtimeRequests();

  if (hospitalsLoading || requestsLoading) {
    return (
      <DashboardLayoutNew title="Government Analytics">
        <p>Loading...</p>
      </DashboardLayoutNew>
    );
  }

  const analytics = getAnalytics(requests, hospitals);

  // Calculate severity distribution percentages
  const totalRequests = analytics.totalRequests || 1;
  const criticalPercent = ((analytics.criticalRequests / totalRequests) * 100).toFixed(1);
  const mediumPercent = ((analytics.mediumRequests / totalRequests) * 100).toFixed(1);
  const lowPercent = ((analytics.lowRequests / totalRequests) * 100).toFixed(1);

  return (
    <DashboardLayoutNew title="Government Analytics">
      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Total Requests"
            value={analytics.totalRequests}
            variant="info"
            icon={TrendingUp}
          />
          <Card
            title="Assigned"
            value={analytics.assignedRequests}
            variant="success"
            icon={CheckCircle}
          />
          <Card
            title="Pending"
            value={analytics.pendingRequests}
            variant="warning"
            icon={Clock}
          />
          <Card
            title="Completed"
            value={analytics.completedRequests}
            variant="gradient"
            icon={AlertCircle}
          />
        </div>

        {/* Request Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Severity */}
          <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Requests by Severity</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Critical</span>
                  <Badge variant="danger" size="sm">{analytics.criticalRequests} ({criticalPercent}%)</Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${criticalPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Medium</span>
                  <Badge variant="warning" size="sm">{analytics.mediumRequests} ({mediumPercent}%)</Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${mediumPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Low</span>
                  <Badge variant="success" size="sm">{analytics.lowRequests} ({lowPercent}%)</Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${lowPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Resources */}
          <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Hospital Resources</h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Available Beds</span>
                  <Badge variant="info" size="sm">{analytics.totalBedsAvailable}</Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Across all hospitals</div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Emergency Capacity</span>
                  <Badge variant="danger" size="sm">{analytics.totalEmergencyCapacity}</Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total emergency beds</div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Bed Utilization</span>
                  <span className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{analytics.bedUtilization}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-cyan-500 h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(parseFloat(analytics.bedUtilization.toString()), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Request Status Distribution</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analytics.assignedRequests}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Assigned</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{analytics.pendingRequests}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Pending</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.completedRequests}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Completed</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{hospitals.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Hospitals</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutNew>
  );
}

