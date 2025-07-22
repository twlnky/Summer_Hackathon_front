import apiClient from './api';
import { User, UserFilter, PageParam, PageResult, SortParam } from '../types';

export class UserService {
  static async getUsers(
    userFilter: UserFilter = {},
    pageParam: PageParam = { page: 0, size: 10 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<User>> {
    const params = new URLSearchParams();
    
    // Добавляем фильтры
    // Передаем globalSearch как firstName для глобального поиска
    if (userFilter.globalSearch) {
      params.append('firstName', userFilter.globalSearch);
      console.log('UserService: Передаем поисковый запрос:', userFilter.globalSearch);
    } else {
      // Иначе используем отдельные поля
      if (userFilter.firstName) params.append('firstName', userFilter.firstName);
      if (userFilter.lastName) params.append('lastName', userFilter.lastName);
      if (userFilter.middleName) params.append('middleName', userFilter.middleName);
    }
    if (userFilter.id) params.append('id', userFilter.id.toString());
    
    // Добавляем пагинацию
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    // Добавляем сортировку
    sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
    
    console.log('UserService: Финальный URL запроса:', `/users/public?${params.toString()}`);
    
    try {
      // Всегда используем публичный эндпоинт для получения пользователей
      // так как согласно бэкенду - это единственный работающий эндпоинт
      const response = await apiClient.get<PageResult<User>>(`/users/public?${params.toString()}`);
      console.log('UserService: Получен ответ от API:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при получении пользователей:', error);
      // Возвращаем пустой результат в случае ошибки
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
    // Передаем globalSearch как firstName для глобального поиска
    if (userFilter.globalSearch) {
      params.append('firstName', userFilter.globalSearch);
      console.log('UserService.getPublicUsers: Передаем поисковый запрос:', userFilter.globalSearch);
    } else {
      // Иначе используем отдельные поля
      if (userFilter.firstName) params.append('firstName', userFilter.firstName);
      if (userFilter.lastName) params.append('lastName', userFilter.lastName);
      if (userFilter.middleName) params.append('middleName', userFilter.middleName);
    }
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