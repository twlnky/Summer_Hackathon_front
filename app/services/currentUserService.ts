import apiClient from './api';
import { User } from '../types';

export class CurrentUserService {
  /**
   * Получает информацию о текущем авторизованном пользователе
   * На данный момент нет эндпоинта /auth/me, поэтому используем заглушку
   */
  static async getCurrentUser(): Promise<User> {
    try {
      // TODO: Когда будет добавлен эндпоинт /auth/me, заменить на него
      // const response = await apiClient.get<User>('/auth/me');
      // return response.data;
      
      // Временная заглушка - возвращаем ошибку, чтобы fallback на localStorage
      throw new Error('Эндпоинт /auth/me еще не реализован на бэкенде');
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Пользователь не авторизован');
      }
      throw error;
    }
  }

  /**
   * Проверяет, имеет ли текущий пользователь права администратора или модератора
   */
  static async hasAdminOrModeratorRights(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user.role === 'ADMIN' || user.role === 'MODERATOR';
    } catch (error) {
      return false;
    }
  }
}

export default CurrentUserService;
