"use client";

import { useState } from "react";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { createRequest } from "@/lib/database";
import { Card, Button, Input, Select, Table, TableRow, TableCell, EmptyTableState, Badge, Alert, useToast } from "@/components/ui";

export default function ReceptionistDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { requests, loading, refetch } = useRealtimeRequests();
  const { showToast } = useToast();
  const [patientName, setPatientName] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      await createRequest({
        patient_name: patientName,
        severity,
        created_by: user.id,
      });

      setPatientName("");
      setSeverity("medium");
      showToast("Request created successfully!", "success");
      await refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create request";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "danger" | "info" => {
    switch (status) {
      case "pending":
        return "warning";
      case "assigned":
        return "info";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getSeverityVariant = (severity: string): "default" | "success" | "warning" | "danger" | "info" => {
    switch (severity) {
      case "critical":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
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
          <Card title="Create New Request">
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <Input
                label="Patient Name"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                required
                disabled={submitting}
              />

              <Select
                label="Severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                disabled={submitting}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "critical", label: "Critical" },
                ]}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={submitting}
              >
                Create Request
              </Button>
            </form>
          </Card>
        </div>

        {/* Requests List */}
        <div className="lg:col-span-2">
          <Card title="All Requests">
            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading requests...</p>
            ) : requests.length === 0 ? (
              <EmptyTableState message="No requests yet." />
            ) : (
              <Table headers={["Patient", "Severity", "Status", "Hospital", "Created"]}>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.patient_name}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityVariant(req.severity)} size="sm">
                        {req.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(req.status)} size="sm">
                        {req.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{req.assigned_hospital || "-"}</TableCell>
                    <TableCell className="text-xs">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </Table>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayoutNew>
  );
}
