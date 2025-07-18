import apiClient from './api';
import { Department, DepartmentFilter, PageParam, PageResult, SortParam, User, UserFilter } from '../types';

export class DepartmentService {
  static async getDepartments(
    departmentFilter: DepartmentFilter = {},
    pageParam: PageParam = { page: 0, size: 10 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<Department>> {
    try {
      const params = new URLSearchParams();
      
      // Добавляем фильтры
      if (departmentFilter.name) params.append('name', departmentFilter.name);
      if (departmentFilter.id) params.append('id', departmentFilter.id.toString());
      
      // Добавляем пагинацию
      params.append('page', pageParam.page.toString());
      params.append('size', pageParam.size.toString());
      
      // Добавляем сортировку
      sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
      
      const url = `/departments/public?${params.toString()}`;
      console.log('Fetching departments from:', url);
      
      const response = await apiClient.get<PageResult<Department>>(url);
      console.log('Departments response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      
      if (error.response?.status === 401) {
        // Если публичный API департаментов тоже требует авторизацию, возвращаем пустой результат
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

  static async getDepartmentById(id: number): Promise<Department> {
    const response = await apiClient.get<Department>(`/departments/public/${id}`);
    return response.data;
  }

  static async getUsersByDepartment(
    departmentId: number,
    userFilter: UserFilter = {},
    pageParam: PageParam = { page: 0, size: 10 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<User>> {
    const params = new URLSearchParams();
    
    // Добавляем фильтры
    if (userFilter.firstName) params.append('firstName', userFilter.firstName);
    if (userFilter.lastName) params.append('lastName', userFilter.lastName);
    if (userFilter.middleName) params.append('middleName', userFilter.middleName);
    
    // Добавляем пагинацию
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    // Добавляем сортировку
    sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
    
    // Добавляем timestamp для предотвращения кэширования
    params.append('_t', Date.now().toString());

    const url = `/departments/public/${departmentId}/users?${params.toString()}`;
    console.log('getUsersByDepartment: Запрос к URL:', url);

    try {
      const response = await apiClient.get<PageResult<User>>(url);
      console.log('getUsersByDepartment: Успешный ответ:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('getUsersByDepartment: Ошибка запроса:', error);
      if (error.response?.status === 401) {
        // Если API требует авторизацию, возвращаем пустой результат
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

  static async createDepartment(departmentData: Omit<Department, 'id'>): Promise<Department> {
    const response = await apiClient.post<Department>('/departments', departmentData);
    return response.data;
  }

  static async updateDepartment(id: number, departmentData: Partial<Department>): Promise<Department> {
    const response = await apiClient.put<Department>(`/departments/${id}`, departmentData);
    return response.data;
  }

  static async deleteDepartment(id: number): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  }

  // Добавить пользователя в департамент
  static async addUserToDepartment(departmentId: number, userId: number): Promise<void> {
    const url = `/departments/${departmentId}/users/${userId}`;
    console.log('DepartmentService.addUserToDepartment - отправляем POST запрос на:', url);
    console.log('Параметры:', { departmentId, userId });
    
    try {
      const response = await apiClient.post(url);
      console.log('DepartmentService.addUserToDepartment - успешный ответ:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('DepartmentService.addUserToDepartment - ошибка:', error);
      throw error;
    }
  }

  // Удалить пользователя из департамента
  static async removeUserFromDepartment(departmentId: number, userId: number): Promise<void> {
    await apiClient.delete(`/departments/${departmentId}/users/${userId}`);
  }
}

export default DepartmentService;