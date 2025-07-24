'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  InputAdornment,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Person,
  Add,
  Email,
  Phone,
  Business,
  Search,
  Edit,
  Delete,
  MoreVert,
} from '@mui/icons-material';
import {
  User,
  PageResult,
  Department,
  UserWithRole
} from '../types';
import UserService from '../services/userService';
import DepartmentService from '../services/departmentService';
import RoleService from '../services/roleService';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UserForm from './forms/UserForm';

const EnhancedUserManagement: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [users, setUsers] = useState<PageResult<User> | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [moderatorIds, setModeratorIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [canManageUsers, setCanManageUsers] = useState<boolean>(false);
  
  // Состояния для модальных окон
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const pageSize = 12;

  const fetchDepartments = useCallback(async () => {
    try {
      // Загружаем все департаменты (увеличиваем размер страницы)
      const result = await DepartmentService.getDepartments(
        {},
        { page: 0, size: 1000 }, // Загружаем до 1000 департаментов
        { sortBy: ['id:asc'] }
      );
      setDepartments(result.queryResult || []);
      
      // Извлекаем ID модераторов из департаментов
      const moderatorIdsFromDepts = departments
        .map(dept => dept.moderatorId)
        .filter((id): id is number => id !== undefined && id !== null);
      setModeratorIds(moderatorIdsFromDepts);      console.log('Moderator IDs from departments:', moderatorIdsFromDepts);
      setModeratorIds(moderatorIdsFromDepts);
    } catch (error) {
      console.error('Ошибка при загрузке департаментов:', error);
    }
  }, []);

  const getDepartmentName = (departmentIds: number[]) => {
    if (!departmentIds || departmentIds.length === 0) {
      return null;
    }
    
    if (departments.length === 0) {
      return 'Загрузка...';
    }
    
    const department = departments.find(dept => departmentIds.includes(dept.id));
    
    if (!department) {
      return 'Неизвестный департамент';
    }
    
    return department.name;
  };

  const checkUserPermissions = () => {
    if (isAuthenticated && currentUser) {
      // Только админы могут создавать пользователей. Модераторы - нет.
      const hasPermissions = RoleService.canCreateUsers(currentUser);
      setCanManageUsers(hasPermissions);
    } else {
      setCanManageUsers(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let result: PageResult<User>;
      
      if (debouncedSearchQuery) {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append('request', debouncedSearchQuery);
          searchParams.append('page', (page - 1).toString());
          searchParams.append('size', pageSize.toString());
          
          const response = await apiClient.get(`/search?${searchParams.toString()}`);
          
          result = {
            queryResult: response.data.users || [],
            pageCount: response.data.pageCount || 0,
            pageSize: pageSize,
            total: response.data.users?.length || 0,
            currentPage: page - 1,
            totalElements: response.data.users?.length || 0
          };
        } catch (searchError: any) {
          console.error('Ошибка search API:', searchError);
          throw new Error('Ошибка поиска: ' + (searchError.response?.data?.message || searchError.message));
        }
      } else {
        result = await UserService.getPublicUsers(
          {},
          { page: page - 1, size: pageSize },
          { sortBy: ['id:asc'] }
        );
      }
      
      setUsers(result);
    } catch (err: any) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError(err.response?.data?.message || err.message || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, page, pageSize]);

  // Debounce для поискового запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    checkUserPermissions();
    fetchDepartments();
  }, [isAuthenticated, currentUser, fetchDepartments]);

  useEffect(() => {
    // Загружаем пользователей после загрузки департаментов
    if (departments.length > 0) {
      fetchUsers();
    }
  }, [departments, fetchUsers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewUser = (userId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/users/${userId}`);
  };

  const handleAddUser = () => {
    console.log('handleAddUser called');
    setSelectedUser(null);
    setAddDialogOpen(true);
  };

  const handleEditUser = (user: User, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Модераторы могут быть перенаправлены на страницу департамента для редактирования
    if (currentUser?.role === 'MODERATOR') {
      const userDepartmentId = user.departmentsIds?.[0];
      if (userDepartmentId) {
        // Проверяем, является ли модератор владельцем этого департамента, по логину
        const department = departments.find(d => d.id === userDepartmentId);
        if (department?.moderatorLogin === currentUser.username) {
          router.push(`/department/${userDepartmentId}`);
          return; // Прерываем выполнение
        }
      }
    }
    // Админы и остальные случаи - открываем диалог редактирования
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleUserSave = async (savedUser: User) => {
    try {
      setActionLoading(true);
      
      // Закрываем диалоги
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: selectedUser ? 'Пользователь успешно обновлен' : 'Пользователь успешно создан',
        severity: 'success'
      });

      // Обновляем список пользователей
      await fetchUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Ошибка при сохранении пользователя',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserDelete = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await UserService.deleteUser(selectedUser.id);
      
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Пользователь успешно удален',
        severity: 'success'
      });
      
      // Обновляем список пользователей
      await fetchUsers();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Ошибка при удалении пользователя',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Функция для определения роли пользователя - теперь используем RoleService
  const determineUserRole = useCallback((user: User): 'USER' | 'MODERATOR' | 'ADMIN' => {
    const role = RoleService.determineRole(user);
    return role;
  }, []);

  const getRoleLabel = (role: string): string => {
    return RoleService.getRoleLabel(role);
  };

  const getRoleColor = (role: string): 'error' | 'warning' | 'success' => {
    return RoleService.getRoleColor(role);
  };

  const userCanBeManagedByModerator = (moderator: UserWithRole, targetUser: User) => {
    if (moderator.role !== 'MODERATOR') return false;
    
    // Получаем ID департаментов, которыми управляет модератор, по его логину
    const moderatorDepartmentIds = departments
      .filter(d => d.moderatorLogin === moderator.username)
      .map(d => d.id);
      
    if (moderatorDepartmentIds.length === 0) return false;

    // Проверяем, принадлежит ли пользователь хотя бы одному из департаментов модератора
    return targetUser.departmentsIds?.some(id => moderatorDepartmentIds.includes(id));
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      py: 4,
    }}>
      <Container maxWidth="lg">
        {/* Заголовок и кнопка добавления */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Управление пользователями
          </Typography>
          {/* Показываем кнопку добавления только админам */}
          {(() => {
            const canCreate = isAuthenticated && currentUser && RoleService.canCreateUsers(currentUser);
            return canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddUser}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
                  }
                }}
              >
                Добавить пользователя
              </Button>
            );
          })()}
          
          {/* Информационное сообщение для неавторизованных */}
          {!isAuthenticated && (
            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
            </Typography>
          )}
          
          {/* Информационное сообщение для пользователей без прав */}
          {isAuthenticated && currentUser && !RoleService.canCreateUsers(currentUser) && (
            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
            </Typography>
          )}
        </Box>

        {/* Поиск */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
            Быстрый поиск
          </Typography>
          <TextField
            fullWidth
            placeholder="Поиск по имени, фамилии, отчеству, email, телефону, должности, кабинету..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                border: '2px solid rgba(59, 130, 246, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                '&.Mui-focused': {
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
        </Box>

        {/* Контент */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
          </Box>
        ) : (
          <>
            {users && users.queryResult.length > 0 ? (
              <>
                {/* Сетка карточек пользователей */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: 3,
                  mb: 4
                }}>
                  {users.queryResult.map((userData) => {
                    // Определяем роль пользователя
                    const userRole = determineUserRole(userData);
                    
                    return (
                    <Card
                      key={userData.id}
                      onClick={(event) => handleViewUser(userData.id, event)}
                      sx={{
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 25px 50px rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          background: 'rgba(255, 255, 255, 1)',
                        },
                        '&:active': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 15px 35px rgba(59, 130, 246, 0.2)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Заголовок карточки с кнопками действий */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: '#1e293b',
                                lineHeight: 1.2,
                                mb: 0.5,
                              }}
                            >
                              {[userData.lastName, userData.firstName, userData.middleName].filter(Boolean).join(' ')}
                            </Typography>
                            {userData.position && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#64748b',
                                  fontWeight: 500,
                                  mb: 1,
                                }}
                              >
                                {userData.position}
                              </Typography>
                            )}
                          </Box>
                          
                          {/* Кнопки действий - админы видят всегда, модераторы - с условием */}
                          {(() => {
                            const isAdmin = RoleService.isAdmin(currentUser);
                            const isModerator = RoleService.isModerator(currentUser);
                            const canManage = currentUser ? userCanBeManagedByModerator(currentUser, userData) : false;
                            // Показываем кнопки редактирования только администраторам
                            const shouldShowButtons = isAuthenticated && currentUser && isAdmin;
                            
                            return shouldShowButtons && (
                              <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                                <Tooltip title={RoleService.isModerator(currentUser) ? "Перейти в департамент для управления" : "Редактировать"}>
                                  <IconButton
                                    size="small"
                                    onClick={(event) => handleEditUser(userData, event)}
                                    sx={{
                                      color: '#3b82f6',
                                      '&:hover': {
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                      }
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {/* Кнопка удаления - только для админов */}
                                {RoleService.isAdmin(currentUser) && (
                                  <Tooltip title="Удалить">
                                    <IconButton
                                      size="small"
                                      onClick={(event) => handleDeleteUser(userData, event)}
                                      sx={{
                                        color: '#ef4444',
                                        '&:hover': {
                                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        }
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            );
                          })()}
                        </Box>

                        {/* Контактная информация */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {userData.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Email sx={{ color: '#3b82f6', mr: 1.5, fontSize: '1.2rem' }} />
                              <Typography
                                variant="body2"
                                component="a"
                                href={`mailto:${userData.email}`}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  color: '#374151',
                                  fontWeight: 500,
                                  textDecoration: 'none',
                                  '&:hover': {
                                    color: '#3b82f6',
                                    textDecoration: 'underline',
                                  }
                                }}
                              >
                                {userData.email}
                              </Typography>
                            </Box>
                          )}

                          {userData.personalPhone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Phone sx={{ color: '#10b981', mr: 1.5, fontSize: '1.2rem' }} />
                              <Typography
                                variant="body2"
                                component="a"
                                href={`tel:${userData.personalPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  color: '#374151',
                                  fontWeight: 500,
                                  textDecoration: 'none',
                                  '&:hover': {
                                    color: '#10b981',
                                    textDecoration: 'underline',
                                  }
                                }}
                              >
                                {userData.personalPhone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
                </Box>

                {/* Пагинация */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={users.pageCount}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 3,
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          borderColor: '#3b82f6',
                          '&:hover': {
                            backgroundColor: '#2563eb',
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </>
            ) : (
              <Typography variant="body1" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                Пользователи не найдены
              </Typography>
            )}
          </>
        )}
      </Container>

      {/* Диалог добавления пользователя */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ pt: 2 }}>
          {isAuthenticated && currentUser && RoleService.canCreateUsers(currentUser) ? (
            <UserForm
              onSave={handleUserSave}
              onCancel={() => setAddDialogOpen(false)}
              loading={actionLoading}
            />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                Недостаточно прав
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Только администраторы могут создавать новых пользователей
              </Typography>
              <Button 
                onClick={() => setAddDialogOpen(false)}
                sx={{ mt: 2 }}
              >
                Закрыть
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования пользователя */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ pt: 2 }}>
          {isAuthenticated && currentUser && selectedUser && RoleService.isAdmin(currentUser) ? (
            <UserForm
              user={selectedUser}
              onSave={handleUserSave}
              onCancel={() => setEditDialogOpen(false)}
              loading={actionLoading}
            />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                Недостаточно прав
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Только администраторы могут редактировать пользователей
              </Typography>
              <Button 
                onClick={() => setEditDialogOpen(false)}
                sx={{ mt: 2 }}
              >
                Закрыть
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя{' '}
            <strong>
              {selectedUser && 
                [selectedUser.lastName, selectedUser.firstName, selectedUser.middleName]
                  .filter(Boolean).join(' ')
              }
            </strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={actionLoading}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleUserDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <Delete />}
          >
            {actionLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedUserManagement;