"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { updateHospital, Hospital } from "@/lib/database";
import { Card, Button, Input, Table, TableRow, TableCell, EmptyTableState, Badge, Alert, useToast } from "@/components/ui";
import { Bed, MapPin, Users } from "lucide-react";

export default function HospitalAdminDashboard() {
  const { hospitals, loading: hospitalsLoading } = useRealtimeHospitals();
  const { requests } = useRealtimeRequests();
  const { showToast } = useToast();
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [newBedsCount, setNewBedsCount] = useState("");

  const getAssignedPatients = (hospitalId: string) => {
    return requests.filter((r) => r.assigned_hospital === hospitalId && r.status === "assigned");
  };

  const handleUpdateBeds = async () => {
    if (!editingHospital || !newBedsCount) return;

    try {
      await updateHospital(editingHospital.id, {
        available_beds: parseInt(newBedsCount),
      });

      showToast("Beds updated successfully!", "success");
      setEditingHospital(null);
      setNewBedsCount("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update beds";
      showToast(message, "error");
    }
  };

  if (hospitalsLoading) {
    return (
      <DashboardLayoutNew title="Hospital Admin Dashboard">
        <p>Loading...</p>
      </DashboardLayoutNew>
    );
  }

  const assignedRequestsCount = requests.filter((r) => r.status === "assigned").length;

  return (
    <DashboardLayoutNew title="Hospital Admin Dashboard">
      <div className="grid gap-6">
        {/* Hospital Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Total Hospitals"
            value={hospitals.length}
            variant="info"
          />
          <Card
            title="Total Available Beds"
            value={hospitals.reduce((sum, h) => sum + h.available_beds, 0)}
            icon={Bed}
            variant="gradient"
          />
          <Card
            title="Assigned Patients"
            value={assignedRequestsCount}
            icon={Users}
            variant="success"
          />
        </div>

        {/* Hospital Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Hospital Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => {
              const assignedPatients = getAssignedPatients(hospital.id);
              const isEditing = editingHospital?.id === hospital.id;

              return (
                <div key={hospital.id} className="rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{hospital.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <MapPin size={14} />
                        {hospital.location}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-gray-200 dark:border-slate-700 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Available Beds:</span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">{hospital.available_beds}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Emergency Capacity:</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{hospital.emergency_capacity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Assigned Patients:</span>
                        <Badge variant="info" size="sm">{assignedPatients.length}</Badge>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                        <Input
                          type="number"
                          label="New Bed Count"
                          value={newBedsCount}
                          onChange={(e) => setNewBedsCount(e.target.value)}
                          placeholder="Enter new bed count"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleUpdateBeds}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditingHospital(null);
                              setNewBedsCount("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          setEditingHospital(hospital);
                          setNewBedsCount(hospital.available_beds.toString());
                        }}
                      >
                        Update Beds
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Patients Table */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assigned Patients Overview</h2>
          {assignedRequestsCount === 0 ? (
            <EmptyTableState message="No patients currently assigned." />
          ) : (
            <div className="rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <Table headers={["Patient", "Severity", "Status", "Hospital", "Assigned Date"]}>
                {requests
                  .filter((r) => r.status === "assigned")
                  .map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.patient_name}</TableCell>
                      <TableCell>
                        <Badge variant={req.severity === "critical" ? "danger" : req.severity === "medium" ? "warning" : "success"} size="sm">
                          {req.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="info" size="sm">{req.status.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{req.assigned_hospital}</TableCell>
                      <TableCell className="text-xs">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
              </Table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayoutNew>
  );
}
