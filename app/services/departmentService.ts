import apiClient from './api';
import { Department, DepartmentFilter, PageParam, PageResult, SortParam, User, UserFilter } from '../types';

export class DepartmentService {
  static async getDepartments(
    departmentFilter: DepartmentFilter = {},
    pageParam: PageParam = { page: 0, size: 10 },
    sortParam: SortParam = { sortBy: ['id:asc'] }
  ): Promise<PageResult<Department>> {
    const params = new URLSearchParams();
    
    // Добавляем фильтры
    if (departmentFilter.name) params.append('name', departmentFilter.name);
    
    // Добавляем пагинацию
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    // Добавляем сортировку
    sortParam.sortBy.forEach(sort => params.append('sortBy', sort));
    
    const response = await apiClient.get<PageResult<Department>>(`/departments/public?${params.toString()}`);
    return response.data;
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
    
    const response = await apiClient.get<PageResult<User>>(`/departments/public/${departmentId}/users?${params.toString()}`);
    return response.data;
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
}

export default DepartmentService; 