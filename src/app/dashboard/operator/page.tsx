"use client";

import { useState } from "react";
import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayout } from "@/components/Sidebar";
import { runLoadBalancer } from "@/lib/loadBalancer";

export default function OperatorDashboard() {
  const { hospitals, loading: hospitalsLoading, refetch: refetchHospitals } = useRealtimeHospitals();
  const { requests, loading: requestsLoading, refetch: refetchRequests } = useRealtimeRequests();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleRunLoadBalancer = async () => {
    if (pendingRequests.length === 0) {
      setMessage("No pending requests to assign.");
      return;
    }

    setRunning(true);
    setMessage("");

    try {
      const assignedCount = await runLoadBalancer(requests, hospitals);
      setMessage(`Successfully assigned ${assignedCount.length} requests to hospitals.`);
      await Promise.all([refetchRequests(), refetchHospitals()]);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to run load balancer");
    } finally {
      setRunning(false);
    }
  };

  if (hospitalsLoading || requestsLoading) {
    return (
      <DashboardLayout title="Operator Dashboard">
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Operator Dashboard">
      <div className="grid gap-6">
        {/* Load Balancer Control */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Load Balancer Control</h3>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : message.includes("No pending")
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Pending Requests:</strong> {pendingRequests.length}
            </p>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Available Hospitals:</strong> {hospitals.length}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Total Available Beds:</strong> {hospitals.reduce((sum, h) => sum + h.available_beds, 0)}
            </p>
          </div>

          <button
            onClick={handleRunLoadBalancer}
            disabled={running || pendingRequests.length === 0}
            className={`${
              running || pendingRequests.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white font-bold py-3 px-6 rounded-lg transition text-lg w-full`}
          >
            {running ? "Running Load Balancer..." : "Run Load Balancer"}
          </button>
        </div>

        {/* Hospitals Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Hospitals Overview</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <h4 className="font-semibold text-gray-800">{hospital.name}</h4>
                <p className="text-sm text-gray-600">{hospital.location}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Available Beds:</span>
                    <span className="font-semibold text-blue-600">{hospital.available_beds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Capacity:</span>
                    <span className="font-semibold text-red-600">{hospital.emergency_capacity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests Queue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Requests Queue</h3>

          {requests.length === 0 ? (
            <p className="text-gray-500">No requests in the system.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Patient</th>
                    <th className="px-4 py-2 text-left font-semibold">Severity</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Hospital</th>
                    <th className="px-4 py-2 text-left font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      className={`border-b hover:bg-gray-50 ${req.status === "pending" ? "bg-yellow-50" : ""}`}
                    >
                      <td className="px-4 py-3 text-gray-900">{req.patient_name}</td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          req.severity === "critical"
                            ? "text-red-600"
                            : req.severity === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {req.severity.toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            req.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : req.status === "assigned"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{req.assigned_hospital || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
