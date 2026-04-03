"use client";

import { useEffect, useState } from "react";
import { useRealtimeRequests } from "@/hooks/useRealtime";
import { DashboardLayout } from "@/components/Sidebar";
import { fetchAllUsers, updateUserRole, UserProfile } from "@/lib/database";

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
      <DashboardLayout title="Master Admin">
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Master Admin">
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

        {/* Users Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <p className="text-sm font-medium opacity-90">Total Users</p>
            <p className="text-4xl font-bold mt-2">{users.length}</p>
          </div>

          {ROLES.map((role) => (
            <div key={role} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <p className="text-sm font-medium opacity-90 capitalize">{role.replace("_", " ")}</p>
              <p className="text-4xl font-bold mt-2">{users.filter((u) => u.role === role).length}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">All Users</h3>

          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Current Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingUserId === user.id ? (
                          <div className="flex gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select role</option>
                              {ROLES.map((role) => (
                                <option key={role} value={role} className="capitalize">
                                  {role.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleUpdateRole(user.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingUserId(null);
                                setSelectedRole("");
                              }}
                              className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setSelectedRole(user.role);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm transition"
                          >
                            Edit
                          </button>
                        )}
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
