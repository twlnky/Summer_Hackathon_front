import apiClient from './api';
import { AuthData, RegisterData, JWTResponse, User } from '../types';
import Cookies from 'js-cookie';

export class AuthService {
  static async login(authData: AuthData): Promise<JWTResponse> {
    const response = await apiClient.post<JWTResponse>('/auth/login', authData);
    
    // Сохраняем токен в cookies
    if (response.data.accessToken) {
      Cookies.set('access_token', response.data.accessToken, {
        expires: 7, // 7 дней
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
    
    return response.data;
  }

  static async register(registerData: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/auth/registration', registerData);
    return response.data;
  }

  static logout(): void {
    Cookies.remove('access_token');
  }

  static isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  }

  static getToken(): string | undefined {
    return Cookies.get('access_token');
  }
}

export default AuthService; 