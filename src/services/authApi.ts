import { config } from "@/config/env";
import { apiService } from "./baseApi";
import { useAuthStore, type User } from "@/store/authStore";
import { logger } from "@/lib/logger";

interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: BackendUser;
}

interface ValidateResponse {
  user: BackendUser;
}

interface RefreshResponse {
  accessToken: string;
  user: BackendUser;
}

class AuthApi {
  private transformBackendUser(backendUser: BackendUser): User {
    return {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.name,
      role: backendUser.role,
      restaurantId: backendUser.restaurantId,
    };
  }

  private handleRefreshResponse(response: RefreshResponse) {
    const user = this.transformBackendUser(response.user);
    useAuthStore.getState().setAccessToken(response.accessToken);
    useAuthStore.getState().setUser(user);
    return { user, accessToken: response.accessToken };
  }

  async login(
    credentials: LoginRequest
  ): Promise<{ user: User; accessToken: string }> {
    try {
      const response = await apiService.post<LoginResponse>(
        `${config.userApiUrl}/api/auth/login/restaurant`,
        credentials
      );

      const user = this.transformBackendUser(response.data.user);
      useAuthStore.getState().login(user, response.data.accessToken);

      logger.info("Login successful", { userId: user.id, role: user.role });
      return { user, accessToken: response.data.accessToken };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorData = (error as { response?: { data?: unknown } }).response
        ?.data;
      logger.error("Login failed", errorData || errorMessage);
      throw error;
    }
  }

  async validateToken(): Promise<User> {
    try {
      const response = await apiService.get<ValidateResponse>(
        `${config.userApiUrl}/api/auth/validate`
      );

      const user = this.transformBackendUser(response.data.user);

      useAuthStore.getState().setUser(user);
      logger.info("Token validation successful", {
        userId: user.id,
        role: user.role,
      });
      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorData = (error as { response?: { data?: unknown } }).response
        ?.data;
      logger.error("Token validation failed", errorData || errorMessage);
      throw error;
    }
  }

  async refreshToken(): Promise<{ user: User; accessToken: string }> {
    try {
      const response = await apiService.post<RefreshResponse>(
        `${config.userApiUrl}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const result = this.handleRefreshResponse(response.data);

      logger.info("Token refresh successful", {
        userId: result.user.id,
        role: result.user.role,
      });
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorData = (error as { response?: { data?: unknown } }).response
        ?.data;
      logger.error("Token refresh failed", errorData || errorMessage);
      throw error;
    }
  }

  async checkAuth(): Promise<User | null> {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        logger.info(
          "No token found in localStorage, attempting refresh from cookie"
        );
        try {
          const result = await this.refreshToken();
          return result.user;
        } catch {
          logger.info("Refresh from cookie failed, user not authenticated");
          return null;
        }
      }

      // Add token to store if not present
      if (!useAuthStore.getState().accessToken) {
        useAuthStore.getState().setAccessToken(token);
      }

      // Validate token
      try {
        const user = await this.validateToken();
        return user;
      } catch {
        logger.info("Token validation failed, attempting refresh");
        try {
          const result = await this.refreshToken();
          return result.user;
        } catch {
          logger.info("Token refresh failed, user not authenticated");
          useAuthStore.getState().logout();
          return null;
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Auth check failed", errorMessage);
      useAuthStore.getState().logout();
      return null;
    }
  }
}

export const authApi = new AuthApi();
