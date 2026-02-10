import React, { createContext, useContext } from "react";

type AuthContextType = {
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({ logout: () => {} });

export const AuthProvider = AuthContext.Provider;

export function useAuth() {
  return useContext(AuthContext);
}
