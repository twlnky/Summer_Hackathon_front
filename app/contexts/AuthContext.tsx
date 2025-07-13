'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthData, RegisterData, User } from '../types';
import AuthService from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (authData: AuthData) => Promise<void>;
  register: (registerData: RegisterData) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Проверяем токен при загрузке приложения
    const token = AuthService.getToken();
    if (token) {
      setIsAuthenticated(true);
      // Здесь можно добавить запрос для получения информации о пользователе
      // если такой endpoint есть в backend
    }
    setLoading(false);
  }, []);

  const login = async (authData: AuthData): Promise<void> => {
    try {
      await AuthService.login(authData);
      setIsAuthenticated(true);
      // Здесь можно добавить запрос для получения информации о пользователе
    } catch (error) {
      throw error;
    }
  };

  const register = async (registerData: RegisterData): Promise<User> => {
    try {
      const user = await AuthService.register(registerData);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 