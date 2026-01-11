// src/hooks/useFetch.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import apiClient from "./api";
import { AxiosError } from "axios";

interface UseFetchConfig {
  url: string;
  params?: Record<string, any>;
  enabled?: boolean;
}

export function useFetch<T>({
  url,
  params,
  enabled = true,
}: UseFetchConfig) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<T>(url, { params });
      setData(res.data);
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      setError(
        axiosError.response?.data?.detail ||
          axiosError.message ||
          "Error inesperado"
      );
      setData(null); // Limpiar data en caso de error
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params), enabled]);

  // Función para resetear todo
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
}