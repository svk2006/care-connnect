"use client";

import { useState } from "react";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { createRequest } from "@/lib/database";

export default function ReceptionistDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { requests, loading, refetch } = useRealtimeRequests();
  const [patientName, setPatientName] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setMessage("");

    try {
      await createRequest({
        patient_name: patientName,
        severity,
        created_by: user.id,
      });

      setPatientName("");
      setSeverity("medium");
      setMessage("Request created successfully!");
      await refetch();

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

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

  if (authLoading) {
    return (
      <DashboardLayoutNew title="Receptionist Dashboard">
        <p>Loading...</p>
      </DashboardLayoutNew>
    );
  }

  return (
    <DashboardLayoutNew title="Receptionist Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Request Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Request</h3>

            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.includes("successfully")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
              >
                {submitting ? "Creating..." : "Create Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Requests List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">All Requests</h3>

            {loading ? (
              <p className="text-gray-500">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-gray-500">No requests yet.</p>
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
                      <tr key={req.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{req.patient_name}</td>
                        <td className={`px-4 py-3 ${getSeverityColor(req.severity)}`}>{req.severity}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                            {req.status}
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
      </div>
    </DashboardLayoutNew>
  );
}
