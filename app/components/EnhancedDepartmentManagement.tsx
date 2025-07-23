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
  Business,
  Add,
  Search,
  Edit,
  Delete,
  Description,
  Group,
} from '@mui/icons-material';
import { Department, PageResult } from '../types';
import DepartmentService from '../services/departmentService';
import { useAuth } from '../contexts/AuthContext';
import DepartmentForm from './forms/DepartmentForm';

const EnhancedDepartmentManagement: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [canManageDepartments, setCanManageDepartments] = useState<boolean>(false);
  
  // Диалоги
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  
  // Уведомления
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const pageSize = 12;

  const checkUserPermissions = () => {
    console.log('=== DEPARTMENTS checkUserPermissions called ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('currentUser:', currentUser);
    if (isAuthenticated && currentUser) {
      console.log('Checking permissions for user:', currentUser);
      console.log('User role:', currentUser.role);
      
      // Только админы могут создавать и удалять департаменты
      // Модераторы могут только редактировать свой департамент
      const hasPermissions = currentUser.role === 'ADMIN';
      console.log('Can manage departments (ADMIN only):', hasPermissions);
      setCanManageDepartments(hasPermissions);
    } else {
      console.log('User not authenticated or currentUser is null');
      setCanManageDepartments(false);
    }
    console.log('=== DEPARTMENTS checkUserPermissions end ===');
  };

  // Функция для проверки, может ли пользователь редактировать конкретный департамент
  const canEditDepartment = (department: Department) => {
    if (!isAuthenticated || !currentUser) return false;
    
    // Админы могут редактировать любой департамент
    if (currentUser.role === 'ADMIN') return true;
    
    // Модераторы могут редактировать только свой департамент
    if (currentUser.role === 'MODERATOR') {
      return department.moderatorId === currentUser.id;
    }
    
    return false;
  };

  // Функция для проверки, может ли пользователь удалить конкретный департамент
  const canDeleteDepartment = (department: Department) => {
    if (!isAuthenticated || !currentUser) return false;
    
    // Только админы могут удалять департаменты
    return currentUser.role === 'ADMIN';
  };

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filter = debouncedSearchQuery ? { name: debouncedSearchQuery } : {};
      const result = await DepartmentService.getDepartments(
        filter,
        { page: page - 1, size: pageSize }
      );
      setDepartments(result.queryResult || []);
      setTotalPages(result.pageCount || 0);
    } catch (err: any) {
      console.error('Ошибка при загрузке департаментов:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке департаментов');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, page, pageSize]);

  // Debounce для поискового запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Сбрасываем на первую страницу при поиске
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    checkUserPermissions();
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Обработчики для управления департаментами
  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setAddDialogOpen(true);
  };

  const handleEditDepartment = (department: Department, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedDepartment(department);
    setEditDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleDepartmentSave = async (savedDepartment: Department) => {
    try {
      await fetchDepartments(); // Перезагружаем список
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setSelectedDepartment(null);
      
      setSnackbar({
        open: true,
        message: selectedDepartment ? 'Департамент успешно обновлен' : 'Департамент успешно создан',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при сохранении департамента:', error);
    }
  };

  const handleDepartmentDelete = async () => {
    if (!selectedDepartment) return;

    setActionLoading(true);
    try {
      await DepartmentService.deleteDepartment(selectedDepartment.id);
      await fetchDepartments(); // Перезагружаем список
      setDeleteDialogOpen(false);
      setSelectedDepartment(null);
      
      setSnackbar({
        open: true,
        message: 'Департамент успешно удален',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Ошибка при удалении департамента:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при удалении департамента',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDepartmentClick = (department: Department) => {
    router.push(`/department/${department.id}`);
  };

  if (loading && departments.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
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
            Управление департаментами
          </Typography>
          {isAuthenticated && currentUser && canManageDepartments && currentUser.role === 'ADMIN' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddDepartment}
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
                  <Search sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }
            }}
          />
        </Box>

        {/* Ошибки */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Карточки департаментов */}
        {loading && departments.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={30} />
          </Box>
        )}

        <>
          {departments.length > 0 ? (
            <>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 3,
                mb: 4
              }}>
                {departments.map((department) => (
                  <Card
                    key={department.id}
                    onClick={() => handleDepartmentClick(department)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(59, 130, 246, 0.1)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(59, 130, 246, 0.15)',
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
                              mb: 1,
                            }}
                          >
                            {department.name}
                          </Typography>
                          {department.description && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#64748b',
                                fontWeight: 500,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {department.description}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Кнопки управления */}
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                          <Tooltip title="Управление сотрудниками">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                router.push(`/department/${department.id}`);
                              }}
                              sx={{
                                color: '#10b981',
                                '&:hover': {
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                }
                              }}
                            >
                              <Group fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {/* Кнопка редактирования - для админов всегда, для модераторов только их департамент */}
                          {canEditDepartment(department) && (
                            <Tooltip title="Редактировать">
                              <IconButton
                                size="small"
                                onClick={(event) => handleEditDepartment(department, event)}
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
                          )}
                          {/* Кнопка удаления - только для админов */}
                          {canDeleteDepartment(department) && (
                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                onClick={(event) => handleDeleteDepartment(department, event)}
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
                      </Box>

                      {/* Дополнительная информация */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ color: '#3b82f6', mr: 1.5, fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                          ID: {department.id}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Пагинация */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPagination-ul': {
                        justifyContent: 'center',
                      },
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 600,
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
      </Box>

      {/* Диалог добавления департамента */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ pt: 2 }}>
          <DepartmentForm
            onSave={handleDepartmentSave}
            onCancel={() => setAddDialogOpen(false)}
            loading={actionLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования департамента */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ pt: 2 }}>
          {selectedDepartment && (
            <DepartmentForm
              department={selectedDepartment}
              onSave={handleDepartmentSave}
              onCancel={() => setEditDialogOpen(false)}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Подтвердите удаление
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Вы действительно хотите удалить департамент{' '}
            <strong>
              {selectedDepartment?.name}
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
            onClick={handleDepartmentDelete}
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
    </Container>
  );
};

export default EnhancedDepartmentManagement;