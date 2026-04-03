import { Request, Hospital, updateRequest, updateHospital } from "@/lib/database";

/**
 * Load balancer function that assigns the best hospital to a request
 * Logic:
 * - Filters hospitals with available beds
 * - If severity is critical, sorts by emergency_capacity DESC
 * - Otherwise, sorts by available_beds DESC
 * - Picks the top hospital
 * - Updates request.assigned_hospital
 * - Reduces hospital.available_beds
 */
export async function assignHospital(request: Request, hospitals: Hospital[]): Promise<string | null> {
  // Filter hospitals with available beds
  const availableHospitals = hospitals.filter((h) => h.available_beds > 0);

  if (availableHospitals.length === 0) {
    console.log("No hospitals with available beds");
    return null;
  }

  // Sort based on severity
  let selectedHospital: Hospital | null = null;

  if (request.severity === "critical") {
    // Sort by emergency_capacity descending
    availableHospitals.sort((a, b) => b.emergency_capacity - a.emergency_capacity);
    selectedHospital = availableHospitals[0];
  } else {
    // Sort by available_beds descending
    availableHospitals.sort((a, b) => b.available_beds - a.available_beds);
    selectedHospital = availableHospitals[0];
  }

  if (!selectedHospital) {
    return null;
  }

  try {
    // Update request with assigned hospital
    await updateRequest(request.id, {
      assigned_hospital: selectedHospital.id,
      status: "assigned",
    });

    // Reduce available beds in the hospital
    await updateHospital(selectedHospital.id, {
      available_beds: selectedHospital.available_beds - 1,
    });

    return selectedHospital.id;
  } catch (error) {
    console.error("Error assigning hospital:", error);
    return null;
  }
}

/**
 * Batch load balance - assigns all pending requests to hospitals
 */
export async function runLoadBalancer(requests: Request[], hospitals: Hospital[]): Promise<string[]> {
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const assignedHospitalIds: string[] = [];

  for (const request of pendingRequests) {
    const hospitalId = await assignHospital(request, hospitals);
    if (hospitalId) {
      assignedHospitalIds.push(hospitalId);
    }
  }

  return assignedHospitalIds;
}

/**
 * Get analytics data
 */
export function getAnalytics(requests: Request[], hospitals: Hospital[]) {
  const totalRequests = requests.length;
  const assignedRequests = requests.filter((r) => r.status === "assigned").length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const completedRequests = requests.filter((r) => r.status === "completed").length;

  const totalBedsAvailable = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
  const totalEmergencyCapacity = hospitals.reduce((sum, h) => sum + h.emergency_capacity, 0);

  const criticalRequests = requests.filter((r) => r.severity === "critical").length;
  const mediumRequests = requests.filter((r) => r.severity === "medium").length;
  const lowRequests = requests.filter((r) => r.severity === "low").length;

  return {
    totalRequests,
    assignedRequests,
    pendingRequests,
    completedRequests,
    totalBedsAvailable,
    totalEmergencyCapacity,
    criticalRequests,
    mediumRequests,
    lowRequests,
    bedUtilization: hospitals.length > 0 ? ((100 * (requests.filter((r) => r.status === "assigned").length)) / totalBedsAvailable).toFixed(1) : "0",
  };
}
