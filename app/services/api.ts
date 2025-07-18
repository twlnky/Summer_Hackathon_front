import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Базовый URL для API
const BASE_URL = 'http://localhost:8080/api/v1';

// Создание axios экземпляра с базовой конфигурацией
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,  // Отключаем cookies чтобы избежать CORS проблем с публичными endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления JWT токена к запросам
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Удаляем токен, но НЕ редиректим автоматически
      Cookies.remove('access_token');
      // Только для защищенных операций редиректим на логин
      // Анонимные пользователи могут продолжать просмотр
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient; 