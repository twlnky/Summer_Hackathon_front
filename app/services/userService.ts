import apiClient from './api';
import { User, UserFilter, PageParam, PageResult, SortParam } from '../types';

export class UserService {
  static async getUsers(
    userFilter: UserFilter = {},
    pageParam: PageParam = { page: 0, size: 10 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<User>> {
    // Если это глобальный поиск, используем search API
    if (userFilter.globalSearch) {
      console.log('UserService: Используем search API для глобального поиска:', userFilter.globalSearch);
      try {
        const params = new URLSearchParams();
        params.append('request', userFilter.globalSearch);
        params.append('page', pageParam.page.toString());
        params.append('size', pageParam.size.toString());
        
        const response = await apiClient.get(`/search?${params.toString()}`);
        console.log('UserService: Получен ответ от search API:', response.data);
        
        // Возвращаем только пользователей из результата поиска
        return {
          queryResult: response.data.users || [],
          pageCount: response.data.pageCount || 0,
          pageSize: pageParam.size,
          total: response.data.users?.length || 0,
          currentPage: pageParam.page,
          totalElements: response.data.users?.length || 0
        };
      } catch (error: any) {
        console.error('Ошибка при поиске через search API:', error);
        // Fallback на публичный API
        return await this.getPublicUsers(userFilter, pageParam, sortParam);
      }
    }

    // Для обычных фильтров используем стандартный API
    const params = new URLSearchParams();
    
    // Добавляем фильтры для обычного поиска
    if (userFilter.firstName) params.append('firstName', encodeURIComponent(userFilter.firstName));
    if (userFilter.lastName) params.append('lastName', encodeURIComponent(userFilter.lastName));
    if (userFilter.middleName) params.append('middleName', encodeURIComponent(userFilter.middleName));
    if (userFilter.id) params.append('id', userFilter.id.toString());
    
    // Добавляем пагинацию
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    // Добавляем сортировку
    sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
    
    console.log('UserService: Финальный URL запроса:', `/users/public?${params.toString()}`);
    
    try {
      // Сначала пытаемся использовать авторизованный эндпоинт
      const response = await apiClient.get<PageResult<User>>(`/users?${params.toString()}`);
      console.log('UserService: Получен ответ от авторизованного API:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при получении пользователей из авторизованного API:', error);
      
      // Если нет авторизации, используем публичный эндпоинт
      if (error.response?.status === 401) {
        try {
          console.log('UserService: Переключаемся на публичный поиск');
          return await this.getPublicUsers(userFilter, pageParam, sortParam);
        } catch (publicError: any) {
          console.error('Ошибка при поиске через публичный API:', publicError);
        }
      }
      
      // Если все попытки неудачны, возвращаем пустой результат
      return {
        queryResult: [],
        pageCount: 0,
        pageSize: pageParam.size,
        total: 0,
        currentPage: pageParam.page,
        totalElements: 0
      };
    }
  }

  // Публичный метод для получения всех пользователей (доступен анонимным пользователям)
  static async getPublicUsers(
    userFilter: UserFilter = {},
    pageParam: PageParam = { page: 0, size: 10 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<User>> {
    const params = new URLSearchParams();
    
    // Добавляем фильтры
    // Для публичного API не используем globalSearch, так как он не работает правильно
    // Используем только отдельные поля
    if (userFilter.firstName) params.append('firstName', userFilter.firstName);
    if (userFilter.lastName) params.append('lastName', userFilter.lastName);
    if (userFilter.middleName) params.append('middleName', userFilter.middleName);
    if (userFilter.id) params.append('id', userFilter.id.toString());
    
    // Добавляем пагинацию
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    // Добавляем сортировку
    sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
    
    console.log('UserService.getPublicUsers: Финальный URL запроса:', `/users/public?${params.toString()}`);
    
    const response = await apiClient.get<PageResult<User>>(`/users/public?${params.toString()}`);
    console.log('UserService.getPublicUsers: Получен ответ от API:', response.data);
    return response.data;
  }

  static async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/public/${id}`);
    return response.data;
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users', userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для создания пользователя. Требуются права администратора или модератора.');
      }
      throw error;
    }
  }

  static async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для редактирования пользователя. Требуются права администратора или модератора.');
      }
      throw error;
    }
  }

  static async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Недостаточно прав для удаления пользователя. Требуются права администратора или модератора.');
      }
      throw error;
    }
  }
}

export default UserService;