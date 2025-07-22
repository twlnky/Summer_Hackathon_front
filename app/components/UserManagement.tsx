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
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  InputAdornment,
  Container,
} from '@mui/material';
import {
  Person,
  Add,
  Email,
  Phone,
  Business,
  Search,
} from '@mui/icons-material';
import { User, PageResult } from '../types';
import UserService from '../services/userService';
import CurrentUserService from '../services/currentUserService';
import { useAuth } from '../contexts/AuthContext';

const UserManagement: React.FC = () => {
  console.log('UserManagement компонент рендерится!'); // Отладочная информация
  
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [users, setUsers] = useState<PageResult<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [canManageUsers, setCanManageUsers] = useState<boolean>(false);

  const pageSize = 12; // Показываем 12 карточек на странице

  const checkUserPermissions = async () => {
    if (isAuthenticated && currentUser) {
      try {
        const currentUserData = await CurrentUserService.getCurrentUser();
        setCanManageUsers(currentUserData.role === 'ADMIN' || currentUserData.role === 'MODERATOR');
      } catch (error) {
        console.error('Ошибка при проверке прав:', error);
        setCanManageUsers(false);
      }
    }
  };

  const fetchUsers = useCallback(async () => {
    console.log('UserManagement: Начинаем загрузку пользователей...'); // Отладочная информация
    setLoading(true);
    setError('');
    try {
      const result = await UserService.getUsers(
        { globalSearch: debouncedSearchQuery }, // Используем debouncedSearchQuery
        { page: page - 1, size: pageSize }, // Пагинация
        { sortBy: ['id:asc'] } // Сортировка
      );
      console.log('UserManagement: Пользователи загружены:', result); // Отладочная информация
      setUsers(result);
    } catch (err: any) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, page, pageSize]); // Добавляем зависимости

  // Debounce для поискового запроса
  useEffect(() => {
    console.log('UserManagement: Запущен debounce таймер для:', searchQuery);
    const timer = setTimeout(() => {
      console.log('UserManagement: Debounce завершен, устанавливаем debouncedSearchQuery:', searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Задержка 500ms

    return () => {
      console.log('UserManagement: Debounce таймер отменен');
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    checkUserPermissions();
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Теперь зависим только от fetchUsers

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Сброс на первую страницу при поиске
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewUser = (userId: number, event: React.MouseEvent) => {
    console.log('UserManagement: Кликнули по карточке пользователя с ID:', userId); // Отладочная информация
    console.log('UserManagement: Event:', event); // Отладочная информация
    event.preventDefault();
    event.stopPropagation();
    console.log('UserManagement: Переходим на /users/' + userId); // Отладочная информация
    router.push(`/users/${userId}`);
  };

  const handleAddUser = () => {
    router.push('/users/add');
  };

  const getRoleColor = (role: string): 'error' | 'warning' | 'success' => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MODERATOR':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return 'Администратор';
      case 'MODERATOR':
        return 'Модератор';
      default:
        return 'Пользователь';
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      py: 4,
    }}>
      <Container maxWidth="lg">
        {/* Заголовок */}
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
          {canManageUsers && (
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
          )}
        </Box>

        {/* Информационное сообщение */}
        {!isAuthenticated && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
            }}
          >
            Вы просматриваете список пользователей в режиме только для чтения. Войдите в систему для управления пользователями.
          </Alert>
        )}

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
                  {users.queryResult.map((user) => (
                    <Card
                      key={user.id}
                      onClick={(event) => handleViewUser(user.id, event)}
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
                        {/* Заголовок карточки */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                              {user.firstName} {user.lastName}
                            </Typography>
                            {user.position && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#64748b',
                                  fontWeight: 500,
                                  mb: 1,
                                }}
                              >
                                {user.position}
                              </Typography>
                            )}
                            {user.role && (
                              <Chip
                                label={getRoleLabel(user.role)}
                                color={getRoleColor(user.role)}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  borderRadius: 2,
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Контактная информация */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {user.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Email sx={{ color: '#3b82f6', mr: 1.5, fontSize: '1.2rem' }} />
                              <Typography
                                variant="body2"
                                component="a"
                                href={`mailto:${user.email}`}
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
                                {user.email}
                              </Typography>
                            </Box>
                          )}

                          {user.personalPhone && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Phone sx={{ color: '#10b981', mr: 1.5, fontSize: '1.2rem' }} />
                              <Typography
                                variant="body2"
                                component="a"
                                href={`tel:${user.personalPhone}`}
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
                                {user.personalPhone}
                              </Typography>
                            </Box>
                          )}

                          {user.officeNumber && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Business sx={{ color: '#f59e0b', mr: 1.5, fontSize: '1.2rem' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#374151',
                                  fontWeight: 500,
                                }}
                              >
                                Офис: {user.officeNumber}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Пагинация */}
                {users.pageCount > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={users.pageCount}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: 2,
                          fontWeight: 600,
                          '&.Mui-selected': {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 4,
                border: '1px solid rgba(59, 130, 246, 0.1)',
              }}>
                <Person sx={{ fontSize: 80, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  {searchQuery ? 'Пользователи не найдены' : 'Пользователи отсутствуют'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос' 
                    : 'Добавьте первого пользователя для начала работы'
                  }
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default UserManagement;
