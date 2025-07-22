'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthData, RegisterData, User } from '../types';
import AuthService from '../services/authService';
import CurrentUserService from '../services/currentUserService';

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
    const initializeAuth = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          // Пытаемся получить актуальную информацию о пользователе с сервера
          const user = await CurrentUserService.getCurrentUser();
          setUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          // Если не удалось получить информацию о пользователе, 
          // пробуем восстановить из localStorage
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              console.error('Ошибка при парсинге данных пользователя:', e);
              // Очищаем невалидные данные
              AuthService.logout();
              localStorage.removeItem('user');
            }
          } else {
            // Токен есть, но пользователя нет - очищаем токен
            AuthService.logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (authData: AuthData): Promise<void> => {
    try {
      const response = await AuthService.login(authData);
      setIsAuthenticated(true);
      
      // Получаем актуальную информацию о пользователе с сервера
      try {
        const user = await CurrentUserService.getCurrentUser();
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (userError) {
        console.error('Не удалось получить информацию о пользователе:', userError);
        // В случае ошибки создаем базовый объект пользователя
        const basicUser: User = {
          id: 0,
          firstName: 'Пользователь',
          lastName: '',
          email: authData.username,
          role: 'USER',
          moderatorId: null,
          departmentsIds: []
        };
        setUser(basicUser);
        localStorage.setItem('user', JSON.stringify(basicUser));
      }
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
    localStorage.removeItem('user');
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