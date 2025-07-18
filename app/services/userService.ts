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
    if (userFilter.firstName) params.append('firstName', userFilter.firstName);
    if (userFilter.lastName) params.append('lastName', userFilter.lastName);
    if (userFilter.middleName) params.append('middleName', userFilter.middleName);
    if (userFilter.id) params.append('id', userFilter.id.toString());
    
    // Добавляем пагинацию
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    // Добавляем сортировку
    sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
    
    try {
      const response = await apiClient.get<PageResult<User>>(`/users?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Для анонимных пользователей возвращаем пустой результат
        return {
          queryResult: [],
          pageCount: 0,
          pageSize: pageParam.size,
          total: 0,
          currentPage: pageParam.page,
          totalElements: 0
        };
      }
      throw error;
    }
  }

  // Добавим отдельный метод для публичного получения пользователей по ID
  static async getPublicUsers(
    userFilter: UserFilter = {},
    pageParam: PageParam = { page: 0, size: 10 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<User>> {
    const params = new URLSearchParams();
    
    // Добавляем фильтры
    if (userFilter.firstName) params.append('firstName', userFilter.firstName);
    if (userFilter.lastName) params.append('lastName', userFilter.lastName);
    if (userFilter.middleName) params.append('middleName', userFilter.middleName);
    if (userFilter.id) params.append('id', userFilter.id.toString());
    
    // Добавляем пагинацию
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    // Добавляем сортировку
    sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
    
    const response = await apiClient.get<PageResult<User>>(`/users/public?${params.toString()}`);
    return response.data;
  }

  static async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/public/${id}`);
    return response.data;
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  }

  static async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  static async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
}

export default UserService; 