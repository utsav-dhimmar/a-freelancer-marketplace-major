import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';
import { adminApi } from '../api/admin';
import type { IUser } from '../types';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    role: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: IUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Checks if we are currently on an admin route.
 */
function isAdminRoute(): boolean {
  return window.location.pathname.startsWith('/admin');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (isAdminRoute()) {
        // Use admin-specific /admin/me endpoint
        const adminUser = await adminApi.getMe();
        setUser(adminUser);
      } else {
        // Use normal user /users/me endpoint
        const response = await authApi.me();
        // authApi.me() returns the full API response — extract user
        const userData =
          (response as unknown as { data?: { user?: IUser } })?.data?.user ??
          response;
        setUser(userData as IUser);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    // authApi.login() returns full API response — extract user
    const userData =
      (response as unknown as { data?: { user?: IUser } })?.data?.user ??
      (response as unknown as { user?: IUser })?.user ??
      response;
    setUser(userData as IUser);
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    role: string,
  ) => {
    await authApi.register({ email, username, password, role });
  };

  const logout = async () => {
    try {
      if (isAdminRoute()) {
        // Use admin-specific /admin/logout endpoint
        await adminApi.logout();
      } else {
        // Use normal user /users/logout endpoint
        await authApi.logout();
      }
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
