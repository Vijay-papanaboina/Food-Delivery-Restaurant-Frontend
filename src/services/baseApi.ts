import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { config } from "@/config/env";
import { useAuthStore } from "@/store/authStore";
import { logger } from "@/lib/logger";

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token =
          useAuthStore.getState().accessToken ||
          localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          logger.warn("No JWT token available for request");
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401 errors
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const refreshResponse = await axios.post(
              `${config.userApiUrl}/api/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const { accessToken, user } = refreshResponse.data;
            useAuthStore.getState().setAccessToken(accessToken);
            useAuthStore.getState().setUser(user);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            useAuthStore.getState().logout();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }
}

export const apiService = new ApiService();
