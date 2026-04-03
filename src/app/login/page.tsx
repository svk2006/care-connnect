"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/database";
import { fetchUserProfile } from "@/lib/database";
import { Button, Input, Alert } from "@/components/ui";
import { LogIn } from "lucide-react";

const roleRoutes: Record<string, string> = {
  patient: "/dashboard/patient",
  receptionist: "/dashboard/receptionist",
  hospital_admin: "/dashboard/hospital",
  operator: "/dashboard/operator",
  government_admin: "/dashboard/government",
  master: "/dashboard/master",
  db_admin: "/dashboard/db-admin",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user } = await signIn(email, password);
      
      if (user) {
        const profile = await fetchUserProfile(user.id);
        const redirectRoute = roleRoutes[profile.role] || "/dashboard";
        router.push(redirectRoute);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500 rounded-lg mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CareConnect</h1>
          <p className="text-gray-300">Hospital Load Balancing System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-gray-100 dark:border-slate-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Welcome Back</h2>

          {error && (
            <Alert 
              type="error" 
              title="Login Error" 
              message={error}
              dismissible
              onClose={() => setError("")}
            />
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              helperText="Enter your registered email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              helperText="Enter your password"
            />

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              fullWidth
              className="mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Section */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Demo Credentials</p>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200 font-mono">
            <p>Email: <span className="text-blue-600 dark:text-blue-300">demo@example.com</span></p>
            <p>Password: <span className="text-blue-600 dark:text-blue-300">demo123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
