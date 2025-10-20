import apiClient from './api';
import { UserWithRole } from '../types';

class RoleService {
    /**
     * Получает информацию о текущем пользователе с ролью из бэкенда
     */
    static async getCurrentUserWithRole(): Promise<UserWithRole> {
        try {
            const response = await apiClient.get<any>('/auth/me');
            const backendUser = response.data;

            const userWithRole: UserWithRole = {
                ...backendUser,
                id: backendUser.id || 0,
                role: 'USER', // Роль по умолчанию
                firstName: backendUser.firstName || '', 
                lastName: backendUser.lastName || '',
                email: backendUser.email || backendUser.username,
                moderatorId: backendUser.moderatorId || null,
                departmentsIds: backendUser.departmentsIds || [],
            };

            if (backendUser.authorities && Array.isArray(backendUser.authorities)) {
                const authorities: string[] = backendUser.authorities.map((auth: any) => (auth.authority || auth).toUpperCase());
                if (authorities.includes('ADMIN')) {
                    userWithRole.role = 'ADMIN';
                } else if (authorities.includes('MODERATOR')) {
                    userWithRole.role = 'MODERATOR';
                }
            }

            return userWithRole;
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Пользователь не авторизован');
            }
            throw new Error('Ошибка при получении информации о пользователе: ' + error.message);
        }
    }

    /**
     * Определяет роль пользователя на основе данных
     */
    static determineRole(user: any): 'USER' | 'MODERATOR' | 'ADMIN' {
        // Приоритет №1: Проверяем массив authorities (самый надежный источник)
        if (user.authorities && Array.isArray(user.authorities)) {
            const authorities = user.authorities.map((auth: any) => (auth.authority || auth).toUpperCase());
            if (authorities.includes('ADMIN')) return 'ADMIN';
            if (authorities.includes('MODERATOR')) return 'MODERATOR';
        }

        if (user.role) {
            return user.role;
        }

        // Приоритет №3: Проверяем по логину для администраторов
        const login = (user.username || user.login || user.email || '').toLowerCase();
        const adminLogins = ['admin', 'admin.larionov', 'administrator', 'artyom.larionov'];
        if (adminLogins.includes(login) || login.startsWith('admin.')) {
            return 'ADMIN';
        }

        // Приоритет №4: Проверяем по moderatorId для модераторов
        if (user.moderatorId) {
            return 'MODERATOR';
        }

        // По умолчанию - обычный пользователь
        return 'USER';
    }

    /**
     * Проверяет, является ли пользователь администратором
     */
    static isAdmin(user: UserWithRole | null): boolean {
        return user?.role === 'ADMIN';
    }

    /**
     * Проверяет, является ли пользователь модератором
     */
    static isModerator(user: UserWithRole | null): boolean {
        return user?.role === 'MODERATOR';
    }

    /**
     * Проверяет, может ли пользователь управлять другими пользователями
     * Согласно требованиям - только ADMIN может создавать пользователей
     */
    static canManageUsers(user: UserWithRole | null): boolean {
        return this.isAdmin(user); // Только админы могут управлять пользователями
    }

    /**
     * Проверяет, может ли пользователь создавать пользователей
     * Согласно требованиям - только ADMIN может создавать пользователей
     */
    static canCreateUsers(user: UserWithRole | null): boolean {
        return this.isAdmin(user);
    }

    /**
     * Проверяет, может ли пользователь управлять департаментами
     * Согласно требованиям - только ADMIN может создавать департаменты
     */
    static canManageDepartments(user: UserWithRole | null): boolean {
        return this.isAdmin(user); // Только админы могут создавать/удалять департаменты
    }

    /**
     * Проверяет, может ли пользователь создавать департаменты
     * Согласно требованиям - только ADMIN может создавать департаменты
     */
    static canCreateDepartments(user: UserWithRole | null): boolean {
        return this.isAdmin(user);
    }

    /**
     * Проверяет, может ли пользователь редактировать департамент
     */
    static canEditDepartment(user: UserWithRole | null, departmentModeratorLogin?: string): boolean {
        if (!user) return false;

        // Админы могут редактировать любой департамент
        if (this.isAdmin(user)) return true;

        // Модераторы могут редактировать только свой департамент, сверяя логины
        if (this.isModerator(user) && departmentModeratorLogin) {
            return user.username === departmentModeratorLogin;
        }

        return false;
    }

    /**
     * Проверяет, может ли пользователь удалять департаменты
     * Согласно требованиям - только ADMIN может удалять департаменты
     */
    static canDeleteDepartment(user: UserWithRole | null): boolean {
        return this.isAdmin(user);
    }

    /**
     * Проверяет, может ли пользователь назначать модераторов к департаментам
     * Согласно требованиям - только ADMIN может привязывать модераторов
     */
    static canAssignModerators(user: UserWithRole | null): boolean {
        return this.isAdmin(user);
    }

    /**
     * Проверяет, может ли пользователь просматривать список модераторов
     */
    static canViewModerators(user: UserWithRole | null): boolean {
        return this.isAdmin(user);
    }

    /**
     * Проверяет, имеет ли пользователь административные права
     */
    static hasAdminPrivileges(user: UserWithRole | null): boolean {
        return this.isAdmin(user);
    }

    /**
     * Проверяет, имеет ли пользователь права модератора или выше
     */
    static hasModeratorPrivileges(user: UserWithRole | null): boolean {
        return this.isAdmin(user) || this.isModerator(user);
    }

    /**
     * Получает локализованное название роли
     */
    static getRoleLabel(role: string): string {
        switch (role) {
            case 'ADMIN':
                return 'Администратор';
            case 'MODERATOR':
                return 'Модератор';
            default:
                return 'Пользователь';
        }
    }

    /**
     * Получает цвет для роли (для Material-UI Chip)
     */
    static getRoleColor(role: string): 'error' | 'warning' | 'success' {
        switch (role) {
            case 'ADMIN':
                return 'error';
            case 'MODERATOR':
                return 'warning';
            default:
                return 'success';
        }
    }

    /**
     * Получает иконку для роли
     */
    static getRoleIcon(role: string): string {
        switch (role) {
            case 'ADMIN':
                return 'admin_panel_settings';
            case 'MODERATOR':
                return 'supervisor_account';
            default:
                return 'person';
        }
    }

    /**
     * Проверяет, может ли пользователь выполнить действие над другим пользователем
     */
    static canModifyUser(currentUser: UserWithRole | null, targetUser: any): boolean {
        if (!currentUser) return false;

        // Админы могут изменять любых пользователей
        if (this.isAdmin(currentUser)) return true;

        // Модераторы могут изменять пользователей в своем департаменте
        if (this.isModerator(currentUser)) {
            // Проверяем, что целевой пользователь не является админом или модератором
            if (targetUser.role === 'ADMIN' || targetUser.role === 'MODERATOR') {
                return false;
            }

            // Модераторы могут редактировать пользователей в своем департаменте
            // Эта проверка будет выполняться на уровне компонентов, где есть доступ к информации о департаментах
            return true;
        }

        return false;
    }
}

export default RoleService;