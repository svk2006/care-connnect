"use client";

import { useState } from "react";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
import { useRealtimeHospitals, useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { runLoadBalancer } from "@/lib/loadBalancer";
import { Card, Button, Badge, useToast } from "@/components/ui";
import { Zap, Building2, Bed } from "lucide-react";

export default function OperatorDashboard() {
  const { hospitals, loading: hospitalsLoading, refetch: refetchHospitals } = useRealtimeHospitals();
  const { requests, loading: requestsLoading, refetch: refetchRequests } = useRealtimeRequests();
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleRunLoadBalancer = async () => {
    if (pendingRequests.length === 0) {
      showToast("No pending requests to assign.", "error");
      return;
    }

    setRunning(true);

    try {
      const assignedCount = await runLoadBalancer(requests, hospitals);
      showToast(`Successfully assigned ${assignedCount.length} requests to hospitals.`, "success");
      await Promise.all([refetchRequests(), refetchHospitals()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to run load balancer";
      showToast(message, "error");
    } finally {
      setRunning(false);
    }
  };

  if (hospitalsLoading || requestsLoading) {
    return (
      <DashboardLayoutNew title="Operator Dashboard">
        <p>Loading...</p>
      </DashboardLayoutNew>
    );
  }

  const totalBeds = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
  const assignedRequests = requests.filter((r) => r.status === "assigned");

  return (
    <DashboardLayoutNew title="Operator Dashboard">
      <div className="grid gap-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Pending Requests"
            value={pendingRequests.length}
            variant="warning"
            icon={Zap}
          />
          <Card
            title="Available Hospitals"
            value={hospitals.length}
            variant="info"
            icon={Building2}
          />
          <Card
            title="Total Available Beds"
            value={totalBeds}
            variant="gradient"
            icon={Bed}
          />
          <Card
            title="Assigned Requests"
            value={assignedRequests.length}
            variant="success"
          />
        </div>

        {/* Load Balancer Control */}
        <Card title="Load Balancer Control">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                Ready to balance <strong>{pendingRequests.length}</strong> pending requests across{' '}
                <strong>{hospitals.length}</strong> hospitals
              </p>
            </div>
            <Button
              onClick={handleRunLoadBalancer}
              isLoading={running}
              disabled={pendingRequests.length === 0}
              variant={pendingRequests.length === 0 ? "secondary" : "primary"}
              fullWidth
              size="lg"
            >
              {running ? "Running Load Balancer" : "Run Load Balancer"}
            </Button>
          </div>
        </Card>

        {/* Hospitals Overview */}
        {hospitals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Hospital Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map((hospital) => (
                <Card key={hospital.id} variant="default">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{hospital.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Available Beds:</span>
                        <Badge variant="info" size="sm">{hospital.available_beds}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Emergency Capacity:</span>
                        <Badge variant="danger" size="sm">{hospital.emergency_capacity}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Location:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{hospital.location}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutNew>
  );
}

