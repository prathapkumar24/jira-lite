'use client';
import { apiClient, setInterceptorToken } from '@/lib/api-client';
import { loginResponseSchema, loginValidationSchema } from '@jira-lite/contracts';
import React, { createContext, useContext, useState } from 'react';
import z from 'zod';

// Define the shape of your User Data based on your NestJS return object

type UserType = z.infer<typeof loginResponseSchema.user>;
type LoginFormData = z.infer<typeof loginValidationSchema>;

type AuthContextType = {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to sync React State and Axios simultaneously
  const updateAuthSession = (newToken: null | string, userData: UserType | null) => {
    setToken(newToken);
    setUser(userData);
    setInterceptorToken(newToken); // <-- Updates your Axios interceptor!
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setInterceptorToken(null); // <-- Clears the Axios interceptor
  };

  const login = async (formData: LoginFormData) => {
    try {
      setLoading(true);
      // Hit your NestJS endpoint
      const response = await apiClient.post('/auth/login', formData);

      // Adapt keys to match your NestJS response structure (response.data.data.accessToken)
      const { accessToken, user: userData } = response.data.data;

      updateAuthSession(accessToken, userData);
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: errorMessage || 'Authentication failed. Please verify credentials.',
      };
    }
  };
  /*useEffect(() => {
        setLoading(false);
    }, []);*/
  // Initial load logic (Runs on page reload)
  /*useEffect(() => {
        const handleRefresh = async () => {
            try {
                // NestJS reads your HttpOnly refresh cookie and returns a new short-lived access token
                const response = await apiClient.post('/auth/refresh');
                const { accessToken, user: userData } = response.data;

                updateAuthSession(accessToken, userData);
            } catch (err) {
                logout();
            } finally {
                setLoading(false);
            }
        };

        handleRefresh();
    }, []);*/

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
