import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { logger } from "@/lib/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    logger.info("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
