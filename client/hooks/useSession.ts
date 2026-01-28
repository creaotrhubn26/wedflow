import { useCallback } from "react";

interface Session {
  userId?: string;
  userEmail?: string;
  isAuthenticated: boolean;
}

/**
 * Hook to manage user session state
 * Returns current session information and logout function
 */
export function useSession() {
  const logout = useCallback(async () => {
    // Session logout logic
  }, []);

  const session: Session = {
    isAuthenticated: false,
  };

  return { session, logout };
}
