import { createClient } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Request {
  id: string;
  patient_name: string;
  severity: "low" | "medium" | "critical";
  assigned_hospital: string | null;
  status: "pending" | "assigned" | "completed";
  created_by: string;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  available_beds: number;
  emergency_capacity: number;
  location: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "patient" | "receptionist" | "hospital_admin" | "operator" | "government_admin" | "master" | "db_admin";
  created_at: string;
}

// Requests queries
export async function fetchRequests() {
  const supabase = createClient();
  const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Request[];
}

export async function fetchUserRequests(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Request[];
}

export async function createRequest(request: { patient_name: string; severity: string; created_by: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("requests")
    .insert([{ ...request, status: "pending", assigned_hospital: null }])
    .select();
  if (error) throw error;
  return data[0] as Request;
}

export async function updateRequest(id: string, updates: Partial<Request>) {
  const supabase = createClient();
  const { data, error } = await supabase.from("requests").update(updates).eq("id", id).select();
  if (error) throw error;
  return data[0] as Request;
}

// Hospitals queries
export async function fetchHospitals() {
  const supabase = createClient();
  const { data, error } = await supabase.from("hospitals").select("*").order("name");
  if (error) throw error;
  return data as Hospital[];
}

export async function updateHospital(id: string, updates: Partial<Hospital>) {
  const supabase = createClient();
  const { data, error } = await supabase.from("hospitals").update(updates).eq("id", id).select();
  if (error) throw error;
  return data[0] as Hospital;
}

export async function fetchHospitalById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("hospitals").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Hospital;
}

// Profile queries
export async function fetchUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as UserProfile;
}

export async function fetchAllUsers() {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").select("*").order("full_name");
  if (error) throw error;
  return data as UserProfile[];
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", userId).select();
  if (error) throw error;
  return data[0] as UserProfile;
}

// Auth
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        role: "patient",
      },
    ]);
    if (profileError) throw profileError;
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// Realtime subscriptions
export function subscribeToRequests(callback: (payload: any) => void): RealtimeChannel {
  const supabase = createClient();
  return supabase
    .channel("requests-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, callback)
    .subscribe();
}

export function subscribeToHospitals(callback: (payload: any) => void): RealtimeChannel {
  const supabase = createClient();
  return supabase
    .channel("hospitals-channel")
    .on("postgres_changes", { event: "*", schema: "public", table: "hospitals" }, callback)
    .subscribe();
}
