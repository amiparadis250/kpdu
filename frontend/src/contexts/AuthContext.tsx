import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types/voting';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (memberId: string, nationalId: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile.user);
        } catch (error) {
          localStorage.removeItem('auth_token');
          api.clearToken();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (memberId: string, nationalId: string) => {
    try {
      setIsLoading(true);
      const response = await api.login(memberId, nationalId);
      
      if (response.requiresOTP) {
        toast.info('OTP sent to your email. Please verify to continue.');
        return;
      }
      
      if (response.token) {
        api.setToken(response.token);
        setUser(response.user);
        localStorage.setItem('kmpdu_user', JSON.stringify(response.user));
        toast.success('Login successful!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await api.verifyOTP(email, otp);
      
      if (response.token) {
        api.setToken(response.token);
        setUser(response.user);
        localStorage.setItem('kmpdu_user', JSON.stringify(response.user));
        toast.success('OTP verified successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    api.clearToken();
    localStorage.removeItem('kmpdu_user');
    toast.info('Logged out successfully');
  };

  const switchRole = () => {
    // Keep existing mock functionality for development
    if (user) {
      const newRole = user.role === 'admin' ? 'member' : 'admin';
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOTP,
        logout,
        switchRole,
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
