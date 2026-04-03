"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayoutNew } from "@/components/DashboardLayoutNew";
import { fetchAllUsers, updateUserRole, UserProfile } from "@/lib/database";
import { Card, Badge, Button, Select, Alert } from "@/components/ui";

const ROLES = ["patient", "receptionist", "hospital_admin", "operator", "government_admin", "master", "db_admin"];

export default function MasterDashboard() {
  const { loading: requestsLoading } = useRealtimeRequests();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await fetchAllUsers();
        setUsers(allUsers);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUpdateRole = async (userId: string) => {
    if (!selectedRole) return;

    try {
      await updateUserRole(userId, selectedRole);
      const updatedUsers = await fetchAllUsers();
      setUsers(updatedUsers);
      setEditingUserId(null);
      setSelectedRole("");
      setMessage("User role updated successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  if (loading || requestsLoading) {
    return (
      <DashboardLayoutNew title="Master Admin">
        <p>Loading...</p>
      </DashboardLayoutNew>
    );
  }

  return (
    <DashboardLayoutNew title="Master Admin">
      <div className="grid gap-6">
        {message && (
          <Alert 
            type={message.includes("successfully") ? "success" : "error"}
            title={message.includes("successfully") ? "Success" : "Error"}
            message={message}
            dismissible
          />
        )}

        {/* Users Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            title="Total Users" 
            value={users.length} 
            variant="info"
          />

          <Card 
            title="Patients" 
            value={users.filter((u) => u.role === "patient").length} 
            variant="success"
          />

          <Card 
            title="Hospital Admins" 
            value={users.filter((u) => u.role === "hospital_admin").length} 
            variant="warning"
          />

          <Card 
            title="Operators" 
            value={users.filter((u) => u.role === "operator").length} 
            variant="info"
          />
        </div>

        {/* Users Table */}
        <Card title="All Users">
          {users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{user.full_name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">
                          {user.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {editingUserId === user.id ? (
                          <div className="flex gap-2">
                            <Select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              options={ROLES.map((role) => ({
                                value: role,
                                label: role.replace("_", " "),
                              }))}
                            />
                            <Button
                              onClick={() => handleUpdateRole(user.id)}
                              variant="primary"
                              size="sm"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingUserId(null);
                                setSelectedRole("");
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setSelectedRole(user.role);
                            }}
                            variant="primary"
                            size="sm"
                          >
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayoutNew>
  );
}
