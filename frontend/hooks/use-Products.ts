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

interface UsePostConfig {
  url: string;
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

export function usePost<TResponse, TBody = any>({
  url,
}: UsePostConfig) {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const post = useCallback(
    async (body: TBody) => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiClient.post<TResponse>(url, body);
        setData(res.data);
        return res.data; // útil para await
      } catch (err) {
        const axiosError = err as AxiosError<any>;
        const message =
          axiosError.response?.data?.detail ||
          axiosError.message ||
          "Error inesperado";

        setError(message);
        setData(null);
        throw message;
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    post,
    reset,
  };
}


interface UseUpdateConfig {
  url: string;
}

export function useUpdate<TResponse, TBody = any>() {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (url: string, body: TBody) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.put<TResponse>(url, body);
      setData(res.data);
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      const message =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "Error inesperado";

      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, update };
}


export function useDelete<TResponse = any>() {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.delete<TResponse>(url);
      setData(res.data);
      return res.data; // permite await
    } catch (err) {
      const axiosError = err as AxiosError<any>;
      const message =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "Error inesperado";

      setError(message);
      throw message;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, remove };
}