"use client";

import { useEffect, useState } from "react";
import { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { Request } from "@/lib/database";
import { fetchUserRequests } from "@/lib/database";
import { Table, TableRow, TableCell, EmptyTableState, Badge } from "@/components/ui";

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

  if (authLoading || loading) {
    return (
      <DashboardLayoutNew title="My Requests">
        <p>Loading...</p>
      </DashboardLayoutNew>
    );
  }

  return (
    <DashboardLayoutNew title="My Requests">
      <div className="grid gap-6">
        {userRequests.length === 0 ? (
          <EmptyTableState message="You have no requests yet." />
        ) : (
          <Table headers={["Request ID", "Severity", "Status", "Assigned Hospital", "Created"]}>
            {userRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="text-xs font-mono">{req.id.substring(0, 8)}...</TableCell>
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
                <TableCell>{req.assigned_hospital || "Not assigned"}</TableCell>
                <TableCell className="text-sm">{new Date(req.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </DashboardLayoutNew>
  );
}
