// src/api/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
});

// ✅ REQUEST interceptor (TIPO CORRECTO)
apiClient.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig => {
    // Ejemplo: token
    // const token =
    //   typeof window !== "undefined"
    //     ? localStorage.getItem("token")
    //     : null;

    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// RESPONSE interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError) => {
    console.error(
      "API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;
