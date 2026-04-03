"use client";

import { useState, useEffect } from "react";
import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayout } from "@/components/Sidebar";
import { updateHospital, Hospital } from "@/lib/database";

export default function HospitalAdminDashboard() {
  const { hospitals, loading: hospitalsLoading } = useRealtimeHospitals();
  const { requests } = useRealtimeRequests();
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [newBedsCount, setNewBedsCount] = useState("");
  const [message, setMessage] = useState("");

  const getAssignedPatients = (hospitalId: string) => {
    return requests.filter((r) => r.assigned_hospital === hospitalId && r.status === "assigned");
  };

  const handleUpdateBeds = async () => {
    if (!editingHospital || !newBedsCount) return;

    try {
      await updateHospital(editingHospital.id, {
        available_beds: parseInt(newBedsCount),
      });

      setMessage("Beds updated successfully!");
      setEditingHospital(null);
      setNewBedsCount("");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update beds");
    }
  };

  if (hospitalsLoading) {
    return (
      <DashboardLayout title="Hospital Admin Dashboard">
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Hospital Admin Dashboard">
      <div className="grid gap-6">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Hospital Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => {
            const assignedPatients = getAssignedPatients(hospital.id);
            return (
              <div key={hospital.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{hospital.name}</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Beds:</span>
                    <span className="font-semibold text-blue-600">{hospital.available_beds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Capacity:</span>
                    <span className="font-semibold text-red-600">{hospital.emergency_capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-700">{hospital.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned Patients:</span>
                    <span className="font-semibold text-purple-600">{assignedPatients.length}</span>
                  </div>
                </div>

                {editingHospital?.id === hospital.id ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={newBedsCount}
                      onChange={(e) => setNewBedsCount(e.target.value)}
                      placeholder="New bed count"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateBeds}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingHospital(null);
                          setNewBedsCount("");
                        }}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-1 rounded transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingHospital(hospital);
                      setNewBedsCount(hospital.available_beds.toString());
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                  >
                    Update Beds
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Assigned Patients Detail */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Assigned Patients Overview</h3>

          {requests.filter((r) => r.status === "assigned").length === 0 ? (
            <p className="text-gray-500">No patients currently assigned.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Patient</th>
                    <th className="px-4 py-2 text-left font-semibold">Severity</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Assigned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter((r) => r.status === "assigned")
                    .map((req) => (
                      <tr key={req.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{req.patient_name}</td>
                        <td className={`px-4 py-3 font-semibold ${
                          req.severity === "critical"
                            ? "text-red-600"
                            : req.severity === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}>
                          {req.severity.toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-gray-900">{req.status}</td>
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
