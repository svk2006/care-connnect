"use client";

import { useEffect, useState, useCallback } from "react";
import { Request, Hospital, UserProfile, fetchRequests, fetchHospitals, subscribeToRequests, subscribeToHospitals } from "@/lib/database";

interface UseRealtimeRequestsReturn {
  requests: Request[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRealtimeRequests(): UseRealtimeRequestsReturn {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const subscription = subscribeToRequests(() => {
      fetchData();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchData]);

  return { requests, loading, error, refetch: fetchData };
}

interface UseRealtimeHospitalsReturn {
  hospitals: Hospital[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRealtimeHospitals(): UseRealtimeHospitalsReturn {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchHospitals();
      setHospitals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const subscription = subscribeToHospitals(() => {
      fetchData();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchData]);

  return { hospitals, loading, error, refetch: fetchData };
}
