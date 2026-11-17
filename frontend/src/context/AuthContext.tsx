import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api } from "../services/api";
import { setUnauthorizedHandler } from "../services/apiClient";
import { clearToken, getToken, setToken } from "../services/authStorage";
import type { AuthResponse, User } from "../types/api";

type AuthStatus = "loading" | "signed-in" | "signed-out";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Holds the signed-in user for the whole app. The token itself lives in services/authStorage. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? "loading" : "signed-out"));
  const [user, setUser] = useState<User | null>(null);

  const signOutLocally = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("signed-out");
  }, []);

  // Any 401 from the API (expired or revoked session) signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(signOutLocally);
    return () => setUnauthorizedHandler(null);
  }, [signOutLocally]);

  // On page load, check that a saved token still works.
  useEffect(() => {
    if (!getToken()) return;
    const controller = new AbortController();
    api.auth
      .me(controller.signal)
      .then((me) => {
        setUser(me);
        setStatus("signed-in");
      })
      .catch(() => {
        if (!controller.signal.aborted) signOutLocally();
      });
    return () => controller.abort();
  }, [signOutLocally]);

  const accept = useCallback((result: AuthResponse) => {
    setToken(result.token);
    setUser(result.user);
    setStatus("signed-in");
    return result.user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (email, password) => accept(await api.auth.login({ email, password })),
      register: async (fullName, email, password) =>
        accept(await api.auth.register({ full_name: fullName, email, password })),
      logout: async () => {
        try {
          await api.auth.logout();
        } catch {
          // Already invalid on the server: signing out locally is enough.
        }
        signOutLocally();
      },
    }),
    [status, user, accept, signOutLocally],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

/** "Aliya Serikova" -> "AS". */
export function initialsOf(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
