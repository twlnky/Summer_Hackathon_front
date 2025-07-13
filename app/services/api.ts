import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Базовый URL для API
const BASE_URL = 'http://localhost:8080/api/v1';

// Создание axios экземпляра с базовой конфигурацией
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,  // Включаем отправку cookies
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
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient; 