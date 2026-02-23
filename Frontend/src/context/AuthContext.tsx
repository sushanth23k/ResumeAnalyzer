import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { loginApi, logoutApi, signupApi, AuthUser } from '../services/authApi';

const STORAGE_ACCESS = 'auth_access_token';
const STORAGE_REFRESH = 'auth_refresh_token';
const STORAGE_USER = 'auth_user';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password1: string, password2: string) => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_USER);
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_ACCESS);
    localStorage.removeItem(STORAGE_REFRESH);
    localStorage.removeItem(STORAGE_USER);
    setUser(null);
  }, []);

  // Listen for token refresh failures dispatched by apiClient
  useEffect(() => {
    const handler = () => clearAuth();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await loginApi(email, password);
      localStorage.setItem(STORAGE_ACCESS, result.tokens.access);
      localStorage.setItem(STORAGE_REFRESH, result.tokens.refresh);
      localStorage.setItem(STORAGE_USER, JSON.stringify(result.user));
      setUser(result.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const accessToken = localStorage.getItem(STORAGE_ACCESS) ?? '';
    const refreshToken = localStorage.getItem(STORAGE_REFRESH) ?? '';
    clearAuth();
    if (accessToken && refreshToken) {
      await logoutApi(refreshToken, accessToken).catch(() => {});
    }
  }, [clearAuth]);

  const register = useCallback(
    async (email: string, password1: string, password2: string) => {
      setIsLoading(true);
      try {
        await signupApi(email, password1, password2);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getAccessToken = useCallback(() => localStorage.getItem(STORAGE_ACCESS), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
