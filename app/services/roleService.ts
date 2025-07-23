import apiClient from './api';
import { UserWithRole } from '../types';

class RoleService {
  /**
   * Получает информацию о текущем пользователе с ролью из бэкенда
   */
  static async getCurrentUserWithRole(): Promise<UserWithRole> {
    try {
      const response = await apiClient.get<UserWithRole>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Пользователь не авторизован');
      }
      throw new Error('Ошибка при получении информации о пользователе: ' + error.message);
    }
  }

  /**
   * Определяет роль пользователя на основе данных
   */
  static determineRole(user: any): 'USER' | 'MODERATOR' | 'ADMIN' {
    // Если роль уже определена в объекте пользователя, используем её
    if (user.role) {
      return user.role;
    }

    // Проверяем по moderatorId для модераторов
    if (user.moderatorId && user.moderatorId > 0) {
      return 'MODERATOR';
    }

    // По умолчанию - обычный пользователь
    return 'USER';
  }

  /**
   * Проверяет, является ли пользователь администратором
   */
  static isAdmin(user: UserWithRole | null): boolean {
    return user?.role === 'ADMIN';
  }

  /**
   * Проверяет, является ли пользователь модератором
   */
  static isModerator(user: UserWithRole | null): boolean {
    return user?.role === 'MODERATOR';
  }

  /**
   * Проверяет, может ли пользователь управлять другими пользователями
   */
  static canManageUsers(user: UserWithRole | null): boolean {
    return this.isAdmin(user); // Только админы могут управлять пользователями
  }

  /**
   * Проверяет, может ли пользователь управлять департаментами
   */
  static canManageDepartments(user: UserWithRole | null): boolean {
    return this.isAdmin(user); // Только админы могут создавать/удалять департаменты
  }

  /**
   * Проверяет, может ли пользователь редактировать департамент
   */
  static canEditDepartment(user: UserWithRole | null, departmentModeratorId?: number): boolean {
    if (!user) return false;
    
    // Админы могут редактировать любой департамент
    if (this.isAdmin(user)) return true;
    
    // Модераторы могут редактировать только свой департамент
    if (this.isModerator(user) && departmentModeratorId) {
      return user.id === departmentModeratorId;
    }
    
    return false;
  }

  /**
   * Получает локализованное название роли
   */
  static getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'MODERATOR':
        return 'Модератор';
      default:
        return 'Пользователь';
    }
  }

  /**
   * Получает цвет для роли (для Material-UI Chip)
   */
  static getRoleColor(role: string): 'error' | 'warning' | 'success' {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MODERATOR':
        return 'warning';
      default:
        return 'success';
    }
  }
}

export default RoleService;
