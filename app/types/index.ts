export interface User {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  officeNumber?: number;
  personalPhone?: string;
  position?: string;
  note?: string;
  moderatorId: number;
  email: string;
  departmentsIds: number[];
}

export interface Department {
  id: number;
  name: string;
  moderatorId?: number;
}

export interface AuthData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export interface JWTResponse {
  accessToken: string;
}

export interface SearchResponse {
  departments: Department[];
  users: User[];
  pageCount: number;
}

export interface PageParam {
  page: number;
  size: number;
}

export interface PageResult<T> {
  queryResult: T[];
  pageCount: number;
  currentPage: number;
  totalElements: number;
}

export interface UserFilter {
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

export interface DepartmentFilter {
  name?: string;
}

export interface SortParam {
  sortBy: string[];
}

export interface ErrorResponse {
  message: string;
  details?: string;
} 