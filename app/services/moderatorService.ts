import apiClient from './api';
import { PageResult, PageParam, SortParam } from '../types';

// Интерфейс для модератора
export interface Moderator {
  id: number;
  login: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  departmentsIds: number[];
}

// Фильтр для модераторов
export interface ModeratorFilter {
  login?: string;
}

export class ModeratorService {
  /**
   * Получает список всех модераторов (доступно только админам)
   */
  static async getModerators(
    filter: ModeratorFilter = {},
    pageParam: PageParam = { page: 0, size: 100 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<Moderator>> {
    try {
      const params = new URLSearchParams();
      
      // Добавляем фильтры
      if (filter.login) params.append('login', filter.login);
      
      // Добавляем пагинацию
      params.append('page', pageParam.page.toString());
      params.append('size', pageParam.size.toString());
      
      // Добавляем сортировку
      sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
      
      const response = await apiClient.get<PageResult<Moderator>>(`/moderators?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при получении списка модераторов:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Пользователь не авторизован');
      } else if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для просмотра списка модераторов');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка при получении списка модераторов');
    }
  }

  /**
   * Получает модератора по ID
   */
  static async getModeratorById(id: number): Promise<Moderator> {
    try {
      const response = await apiClient.get<Moderator>(`/moderators/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при получении модератора:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Пользователь не авторизован');
      } else if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для просмотра модератора');
      } else if (error.response?.status === 404) {
        throw new Error('Модератор не найден');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка при получении модератора');
    }
  }

  /**
   * Создает нового модератора (доступно только админам)
   */
  static async createModerator(moderatorData: Omit<Moderator, 'id'>): Promise<Moderator> {
    try {
      const response = await apiClient.post<Moderator>('/moderators', moderatorData);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при создании модератора:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Пользователь не авторизован');
      } else if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для создания модератора. Требуются права администратора.');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка при создании модератора');
    }
  }

  /**
   * Обновляет модератора (доступно только админам)
   */
  static async updateModerator(id: number, moderatorData: Partial<Moderator>): Promise<Moderator> {
    try {
      const response = await apiClient.put<Moderator>(`/moderators/${id}`, moderatorData);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при обновлении модератора:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Пользователь не авторизован');
      } else if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для редактирования модератора. Требуются права администратора.');
      } else if (error.response?.status === 404) {
        throw new Error('Модератор не найден');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка при обновлении модератора');
    }
  }

  /**
   * Удаляет модератора (доступно только админам)
   */
  static async deleteModerator(id: number): Promise<void> {
    try {
      await apiClient.delete(`/moderators/${id}`);
    } catch (error: any) {
      console.error('Ошибка при удалении модератора:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Пользователь не авторизован');
      } else if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для удаления модератора. Требуются права администратора.');
      } else if (error.response?.status === 404) {
        throw new Error('Модератор не найден');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка при удалении модератора');
    }
  }

  /**
   * Получает список доступных модераторов для назначения (без департамента или с возможностью переназначения)
   */
  static async getAvailableModerators(): Promise<Moderator[]> {
    try {
      const result = await this.getModerators({}, { page: 0, size: 1000 });
      return result.queryResult;
    } catch (error) {
      console.error('Ошибка при получении доступных модераторов:', error);
      return [];
    }
  }
}

export default ModeratorService; 