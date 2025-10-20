import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const AuthService = {
    async login(credentials: { username: string; password: string }) {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
            withCredentials: true, // чтобы получать cookie
        });
        return response.data;
    },

    async register(userData: any) {
        const response = await axios.post(`${API_BASE_URL}/auth/registration`, userData);
        return response.data;
    },

    // ✅ Добавлен метод logout
    async logout(): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log('✅ Logout request sent to server');
        } catch (error) {
            console.error('❌ Logout request failed:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
    },

    getToken(): string | null {
        return localStorage.getItem('accessToken');
    }
};

export default AuthService;