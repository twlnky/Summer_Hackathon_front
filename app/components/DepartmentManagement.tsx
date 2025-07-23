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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  InputAdornment,
  Container,
  Chip,
} from '@mui/material';
import {
  Business,
  Add,
  People,
  Search,
  Person,
  SupervisorAccount,
  Description,
} from '@mui/icons-material';
import { Department, DepartmentFilter, PageResult, User } from '../types';
import DepartmentService from '../services/departmentService';
import CurrentUserService from '../services/currentUserService';
import { useAuth } from '../contexts/AuthContext';

const DepartmentManagement: React.FC = () => {
  console.log('DepartmentManagement компонент рендерится!'); // Отладочная информация
  
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [departments, setDepartments] = useState<PageResult<Department> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [canManageDepartments, setCanManageDepartments] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const pageSize = 12; // Показываем 12 карточек на странице

  const checkUserPermissions = async () => {
    if (isAuthenticated && currentUser) {
      try {
        const currentUserData = await CurrentUserService.getCurrentUser();
        setCanManageDepartments(currentUserData.role === 'ADMIN' || currentUserData.role === 'MODERATOR');
      } catch (error) {
        console.error('Ошибка при проверке прав:', error);
        setCanManageDepartments(false);
      }
    }
  };

  const fetchDepartments = useCallback(async () => {
    console.log('DepartmentManagement: Начинаем загрузку департаментов...'); // Отладочная информация
    setLoading(true);
    setError('');
    try {
      const filter: DepartmentFilter = debouncedSearchQuery ? { name: debouncedSearchQuery } : {};
      const result = await DepartmentService.getDepartments(
        filter,
        { page: page - 1, size: pageSize }
      );
      console.log('DepartmentManagement: Департаменты загружены:', result); // Отладочная информация
      setDepartments(result);
    } catch (err: any) {
      console.error('Ошибка при загрузке департаментов:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке департаментов');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, page, pageSize]); // Добавляем зависимости

  // Debounce для поискового запроса
  useEffect(() => {
    console.log('DepartmentManagement: Запущен debounce таймер для:', searchQuery);
    const timer = setTimeout(() => {
      console.log('DepartmentManagement: Debounce завершен, устанавливаем debouncedSearchQuery:', searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Задержка 500ms

    return () => {
      console.log('DepartmentManagement: Debounce таймер отменен');
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    checkUserPermissions();
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]); // Теперь зависим только от fetchDepartments

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Сброс на первую страницу при поиске
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleViewDepartment = (departmentId: number, event: React.MouseEvent) => {
    console.log('DepartmentManagement: Кликнули по карточке департамента с ID:', departmentId); // Отладочная информация
    console.log('DepartmentManagement: Event:', event); // Отладочная информация
    event.preventDefault();
    event.stopPropagation();
    console.log('DepartmentManagement: Переходим на /department/' + departmentId); // Отладочная информация
    router.push(`/department/${departmentId}`);
  };

  const handleOpenDialog = (department?: Department) => {
    setSelectedDepartment(department || null);
    setFormData(department || {
      name: '',
      moderatorId: 1,
    });
    setIsEditing(!!department);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDepartment(null);
    setFormData({});
    setIsEditing(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isEditing && selectedDepartment) {
        await DepartmentService.updateDepartment(selectedDepartment.id, formData);
      } else {
        await DepartmentService.createDepartment(formData as Omit<Department, 'id'>);
      }
      handleCloseDialog();
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при сохранении департамента');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот департамент?')) {
      try {
        await DepartmentService.deleteDepartment(id);
        fetchDepartments();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка при удалении департамента');
      }
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
            Управление департаментами
          </Typography>
          {canManageDepartments && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
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
              Добавить департамент
            </Button>
          )}
        </Box>

        {/* Поиск */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
            Быстрый поиск
          </Typography>
          <TextField
            fullWidth
            placeholder="Поиск по названию департамента..."
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
            {departments && departments.queryResult.length > 0 ? (
              <>
                {/* Сетка карточек департаментов */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: 3,
                  mb: 4
                }}>
                  {departments.queryResult.map((department) => (
                    <Card
                      key={department.id}
                      onClick={(event) => handleViewDepartment(department.id, event)}
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
                              {department.name}
                            </Typography>
                            {department.tag && (
                              <Chip
                                label={department.tag}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  mb: 1,
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#64748b',
                                fontWeight: 500,
                              }}
                            >
                              ID: {department.id}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Информация о департаменте */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {department.description && (
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Description sx={{ color: '#3b82f6', mr: 1.5, fontSize: '1.2rem', mt: 0.1 }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#374151',
                                  fontWeight: 500,
                                  lineHeight: 1.4,
                                }}
                              >
                                {department.description}
                              </Typography>
                            </Box>
                          )}

                          {(department.moderatorFirstName || department.moderatorLastName) && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SupervisorAccount sx={{ color: '#10b981', mr: 1.5, fontSize: '1.2rem' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#374151',
                                  fontWeight: 500,
                                }}
                              >
                                Руководитель: {department.moderatorFirstName} {department.moderatorLastName}
                              </Typography>
                            </Box>
                          )}

                          {department.userCount !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <People sx={{ color: '#f59e0b', mr: 1.5, fontSize: '1.2rem' }} />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#374151',
                                  fontWeight: 500,
                                }}
                              >
                                Сотрудников: {department.userCount}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Пагинация */}
                {departments.pageCount > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={departments.pageCount}
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
                <Business sx={{ fontSize: 80, color: '#94a3b8', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  {searchQuery ? 'Департаменты не найдены' : 'Департаменты отсутствуют'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос' 
                    : 'Добавьте первый департамент для начала работы'
                  }
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Диалог создания/редактирования */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isEditing ? 'Редактировать департамент' : 'Создать департамент'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                required
                name="name"
                label="Название департамента"
                value={formData.name || ''}
                onChange={handleFormChange}
              />
              <TextField
                fullWidth
                name="tag"
                label="Тег департамента"
                value={formData.tag || ''}
                onChange={handleFormChange}
              />
              <TextField
                fullWidth
                name="description"
                label="Описание"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={handleFormChange}
              />
              <TextField
                fullWidth
                name="moderatorId"
                label="ID модератора"
                type="number"
                value={formData.moderatorId || ''}
                onChange={handleFormChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained">
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DepartmentManagement;