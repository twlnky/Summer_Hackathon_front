'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthData, RegisterData, User, UserWithRole } from '../types';
import AuthService from '../services/authService';
import RoleService from '../services/roleService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserWithRole | null;
  login: (authData: AuthData) => Promise<void>;
  register: (registerData: RegisterData) => Promise<User>;
  logout: () => void;
  loading: boolean;
  refreshUserInfo: () => Promise<void>;
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
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Функция для обновления информации о пользователе
  const refreshUserInfo = async (): Promise<void> => {
    try {
      const userWithRole = await RoleService.getCurrentUserWithRole();
      setUser(userWithRole);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      console.log('✅ User info refreshed from backend:', userWithRole);
    } catch (error) {
      console.error('❌ Failed to refresh user info:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          const userWithRole = await RoleService.getCurrentUserWithRole();
          setUser(userWithRole);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userWithRole));
          console.log('✅ Auth initialized from backend:', userWithRole);
        } catch (error) {
          console.warn('⚠️ Could not get user from backend, trying localStorage fallback');
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              if (!parsedUser.role) {
                parsedUser.role = RoleService.determineRole(parsedUser);
              }
              setUser(parsedUser);
              setIsAuthenticated(true);
              console.log('📱 Used localStorage fallback:', parsedUser);
            } catch (e) {
              console.error('Ошибка при парсинге данных пользователя:', e);
              AuthService.logout();
              localStorage.removeItem('user');
            }
          } else {
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
      
      try {
        const userWithRole = await RoleService.getCurrentUserWithRole();
        setUser(userWithRole);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        console.log('✅ Login successful, user from backend:', userWithRole);
      } catch (userError) {
        console.warn('⚠️ Could not get user info from backend, using fallback logic');
        
        let userRole: 'USER' | 'MODERATOR' | 'ADMIN' = 'USER';
        const lowerLogin = authData.username.toLowerCase();
        
        const adminLogins = ['admin', 'admin.larionov', 'administrator', 'artyom.larionov'];
        if (adminLogins.includes(lowerLogin) || lowerLogin.startsWith('admin.')) {
          userRole = 'ADMIN';
        } else if (lowerLogin.startsWith('mod.') || lowerLogin.startsWith('moderator.')) {
          userRole = 'MODERATOR';
        }

        const basicUser: UserWithRole = {
          id: 1,
          firstName: userRole === 'ADMIN' ? 'Администратор' : userRole === 'MODERATOR' ? 'Модератор' : authData.username.split('.')[0] || 'Пользователь',
          lastName: userRole === 'ADMIN' ? 'Системы' : userRole === 'MODERATOR' ? 'Модератор' : authData.username.split('.')[1] || 'Системы',
          email: authData.username,
          role: userRole,
          moderatorId: userRole === 'MODERATOR' ? 1 : null,
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
    refreshUserInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
