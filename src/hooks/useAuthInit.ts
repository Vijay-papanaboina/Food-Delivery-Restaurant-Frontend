import { useEffect, useRef } from "react";
import { authApi } from "@/services/authApi";
import { logger } from "@/lib/logger";

export const useAuthInit = () => {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const initializeAuth = async () => {
      try {
        logger.info("Initializing authentication...");
        const user = await authApi.checkAuth();

        if (user) {
          logger.info("User authenticated on app load", {
            userId: user.id,
            role: user.role,
          });
        } else {
          logger.info("No authenticated user found on app load");
        }
      } catch (error: any) {
        logger.error("Auth initialization failed", error.message);
      }
    };

    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
