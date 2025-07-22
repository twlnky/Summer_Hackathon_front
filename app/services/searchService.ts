import apiClient from './api';
import { SearchResponse, PageParam, Department, User } from '../types';
import DepartmentService from './departmentService';
import UserService from './userService';

export class SearchService {
  static async search(
    query: string,
    pageParam: PageParam = { page: 0, size: 10 }
  ): Promise<SearchResponse> {
    try {
      // Сначала пытаемся использовать авторизованный эндпоинт поиска
      const params = new URLSearchParams();
      params.append('request', query);
      params.append('page', pageParam.page.toString());
      params.append('size', pageParam.size.toString());
      
      const response = await apiClient.get<SearchResponse>(`/search?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Если нет авторизации, используем публичные API для поиска
        try {
          // Используем глобальный поиск для пользователей
          const userResults = await UserService.getPublicUsers(
            { globalSearch: query }, 
            { page: 0, size: 20 } // Увеличиваем размер для лучших результатов поиска
          );
          const users = userResults.queryResult;

          // Поиск департаментов по названию
          const departmentResults = await DepartmentService.getDepartments({}, pageParam);
          const departments = departmentResults.queryResult.filter((dept: Department) => 
            dept.name?.toLowerCase().includes(query.toLowerCase()) ||
            dept.tag?.toLowerCase().includes(query.toLowerCase())
          );

          const maxPages = Math.max(
            Math.ceil(users.length / pageParam.size),
            Math.ceil(departments.length / pageParam.size)
          );

          return {
            departments: departments.slice(0, pageParam.size),
            users: users.slice(0, pageParam.size),
            pageCount: maxPages
          };
        } catch (publicError) {
          // Если публичные API недоступны, возвращаем пустой результат
          return {
            departments: [],
            users: [],
            pageCount: 0
          };
        }
      }
      throw error;
    }
  }
}

export default SearchService; 