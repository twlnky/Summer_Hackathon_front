// apiClient.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie'; // ✅ Добавлен импорт

const BASE_URL = 'http://localhost:8080/api/v1';

const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onRrefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axios(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const newAccessToken = response.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                onRrefreshed(newAccessToken);
                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
        }
        return Promise.reject(error);
    }
);

export { apiClient };
export default apiClient;