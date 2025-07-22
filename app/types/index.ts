export interface User {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  officeNumber?: number;
  personalPhone?: string;
  position?: string;
  note?: string;
  moderatorId: number | null;
  email: string;
  departmentsIds: number[];
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface Department {
  id: number;
  name: string;
  moderatorId?: number;
  moderatorLogin?: string;
  moderatorFirstName?: string;
  moderatorLastName?: string;
  moderatorMiddleName?: string;
  moderator?: User;
  tag?: string;
  description?: string;
  userCount?: number;
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
  user?: User; // Добавляем опциональное поле пользователя
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
  pageSize?: number;
  total?: number;
  currentPage?: number;
  totalElements?: number;
}

export interface UserFilter {
  id?: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  // Глобальный поиск - эквивалент передачи одинаковых значений в firstName, lastName, middleName
  globalSearch?: string;
}

export interface DepartmentFilter {
  name?: string;
  id?: number;
}

export interface SortParam {
  sortBy: string[];
}

export interface ErrorResponse {
  message: string;
  details?: string;
} 